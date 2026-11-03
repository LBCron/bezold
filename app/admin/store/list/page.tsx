"use client";
import { useEffect, useRef, useState } from "react";
import { getStores } from "@/firebase/clientUtils";
import { updateStoreStatus } from "@/firebase/clientUtils";
import {
  Space,
  Table,
  Tag,
  Button as AntButton,
  Input,
  DatePicker,
  Modal,
  Select,
  Skeleton,
  Tooltip,
  message,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import Link from "next/link";

import type { TableProps } from "antd";
import type { Store } from "@/types";
import { STORE_STATUS, type StoreStatus } from "@/types";
import {
  formatDigitalTypes,
  formatPriceRange,
  isDigitalAsset,
  listingTypeOf,
} from "@/utils/store";
import { STORE_CATEGORIES } from "@/constant/storeType";
import {
  LISTING_FILTER_OPTIONS,
  LISTING_TYPE_COLOR,
  LISTING_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  type ListingFilter,
} from "@/constant/adminStore";
import { authedFetch } from "@/lib/authedFetch";
import { useAdminAuth, useStoreAnalytics } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  CONTACT_GATE_TRACKING_START,
  DEFAULT_RANGE,
  PAGE_VIEW_TRACKING_START,
} from "@/constant/storeAnalytics";
import ClickRate, { clickRateOf } from "../analytics/_components/ClickRate";
import StoreDetailDrawer, {
  StoreStatusControls,
} from "../_components/StoreDetailDrawer";

type StatusFilter = StoreStatus | "all";

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "所有狀態", value: "all" },
  ...[
    STORE_STATUS.PENDING,
    STORE_STATUS.APPROVED,
    STORE_STATUS.REJECTED,
    STORE_STATUS.SOLD,
  ].map((status) => ({ label: STATUS_LABEL[status], value: status })),
];

// Statuses whose stores a buyer can currently see on the public site.
const PUBLIC_STATUSES: StoreStatus[] = [
  STORE_STATUS.APPROVED,
  STORE_STATUS.SOLD,
];

const BULK_STATUS_ACTIONS: { label: string; status: StoreStatus }[] = [
  { label: "✓ 通過", status: STORE_STATUS.APPROVED },
  { label: "✕ 拒絕", status: STORE_STATUS.REJECTED },
  { label: "已頂讓", status: STORE_STATUS.SOLD },
];

export default function List() {
  const { idToken } = useAdminAuth();
  const [modal, modalHolder] = Modal.useModal();
  const [messageApi, messageHolder] = message.useMessage();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  // storeId whose status is being written (drawer or bulk).
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  // guards against opening a second confirm for the same row (e.g. a same-tick
  // double-click, which the modal mask cannot block until it has mounted).
  const confirmOpenRef = useRef(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [listingFilter, setListingFilter] = useState<ListingFilter>("all");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  // Only the all-time counts are shown here; any range returns them.
  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useStoreAnalytics(DEFAULT_RANGE);
  const allTimeOf = (storeId: string) =>
    analytics?.stores[storeId]?.allTime ?? {
      views: 0,
      gateViews: 0,
      gateClicks: 0,
    };

  useEffect(() => {
    if (analyticsError) messageApi.warning("成效資料暫時無法載入");
  }, [analyticsError, messageApi]);

  const normalizedSearch = search.trim().toLowerCase();
  const [rangeStart, rangeEnd] = dateRange ?? [null, null];
  const activeStore =
    stores.find((store) => store.id === activeStoreId) ?? null;

  const filteredStores = stores.filter((store) => {
    // Drafts live on their own page (/admin/store/drafts).
    if (store.status === STORE_STATUS.DRAFT) return false;

    const matchesSearch =
      !normalizedSearch ||
      store.storeName?.toLowerCase().includes(normalizedSearch) ||
      store.user?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (store.status ?? STORE_STATUS.PENDING) === statusFilter;

    const matchesListing =
      listingFilter === "all" || listingTypeOf(store) === listingFilter;

    const createdAt = store.createTime ? dayjs(store.createTime) : null;
    const matchesDate =
      (!rangeStart || (createdAt && !createdAt.isBefore(rangeStart, "day"))) &&
      (!rangeEnd || (createdAt && !createdAt.isAfter(rangeEnd, "day")));

    return matchesSearch && matchesStatus && matchesListing && matchesDate;
  });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const fetchedStores = await getStores();
      setStores(fetchedStores);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // updateStoreStatus also stamps updateTime server-side; mirror it locally so
  // the 更新 column reflects the change without a refetch.
  const applyStatus = (storeIds: string[], status: StoreStatus) => {
    const now = new Date();
    setStores((previous) =>
      previous.map((store) =>
        storeIds.includes(store.id)
          ? { ...store, status, updateTime: now }
          : store,
      ),
    );
    // A store turned into a draft leaves this list, so its drawer goes too.
    if (status === STORE_STATUS.DRAFT) {
      setActiveStoreId((previous) =>
        previous && storeIds.includes(previous) ? null : previous,
      );
    }
  };

  const handleStatusChange = async (storeId: string, status: StoreStatus) => {
    setUpdating(storeId);
    try {
      await updateStoreStatus(storeId, status);
      applyStatus([storeId], status);
      messageApi.success(`已更新為「${STATUS_LABEL[status]}」`);
    } catch {
      messageApi.error("更新失敗，請稍後再試");
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkStatusChange = async (status: StoreStatus) => {
    setBulkUpdating(true);
    const results = await Promise.allSettled(
      selectedIds.map((storeId) => updateStoreStatus(storeId, status)),
    );
    const succeededIds = selectedIds.filter(
      (_, index) => results[index].status === "fulfilled",
    );
    const failedIds = selectedIds.filter(
      (_, index) => results[index].status === "rejected",
    );
    applyStatus(succeededIds, status);
    // Keep only the failures selected so the admin can retry them.
    setSelectedIds(failedIds);
    setBulkUpdating(false);

    if (failedIds.length === 0) {
      messageApi.success(
        `已將 ${succeededIds.length} 筆更新為「${STATUS_LABEL[status]}」`,
      );
    } else {
      messageApi.error(
        `${failedIds.length} 筆更新失敗（仍保持選取），${succeededIds.length} 筆成功`,
      );
    }
  };

  const confirmConvertToDraft = (storeIds: string[]) => {
    if (confirmOpenRef.current || storeIds.length === 0) return;
    confirmOpenRef.current = true;
    const targets = stores.filter((store) => storeIds.includes(store.id));
    const publicCount = targets.filter((store) =>
      PUBLIC_STATUSES.includes(store.status ?? STORE_STATUS.PENDING),
    ).length;
    const isSingle = storeIds.length === 1;
    const subject = isSingle
      ? `「${targets[0]?.storeName || `商店 ${storeIds[0]}`}」`
      : `${storeIds.length} 間商店`;

    modal.confirm({
      title: "轉為草稿",
      okText: "轉為草稿",
      cancelText: "取消",
      content: (
        <div className="flex flex-col gap-[8px]">
          <span>確定要將{subject}轉為草稿嗎？</span>
          {publicCount > 0 && (
            <span className="font-semibold text-[#d4380d]">
              {isSingle
                ? "這間店目前在前台看得到，轉為草稿後會從前台列表下架。"
                : `其中 ${publicCount} 間目前在前台看得到，轉為草稿後會從前台列表下架。`}
            </span>
          )}
          <span className="text-black/45">
            資料、圖片與瀏覽數都會保留，之後可以在 Draft Stores 送審。
          </span>
        </div>
      ),
      onCancel: () => {
        confirmOpenRef.current = false;
      },
      onOk: async () => {
        if (isSingle) {
          await handleStatusChange(storeIds[0], STORE_STATUS.DRAFT);
        } else {
          await handleBulkStatusChange(STORE_STATUS.DRAFT);
        }
        confirmOpenRef.current = false;
      },
    });
  };

  // * every non-draft store, whatever the filters on this page say (#99)
  const handleExport = async () => {
    if (!idToken) return;
    setExporting(true);
    try {
      const res = await authedFetch(idToken, "/api/admin/stores/export");
      if (!res.ok) throw new Error("Failed to export stores");
      const fileName =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "bezold-sellers.csv";
      const downloadUrl = URL.createObjectURL(await res.blob());
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = fileName;
      anchor.click();
      // * revoke on the next tick so the browser has picked the download up
      setTimeout(() => URL.revokeObjectURL(downloadUrl));
      messageApi.success(`已下載 ${res.headers.get("X-Row-Count")} 筆`);
    } catch {
      messageApi.error("下載失敗，請稍後再試");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      messageApi.success("已複製連結");
    } catch {
      messageApi.error("複製失敗，請手動選取連結");
    }
  };

  const handleDelete = (store: Store) => {
    if (confirmOpenRef.current) return;
    confirmOpenRef.current = true;
    modal.confirm({
      title: "刪除商店",
      okText: "刪除",
      okType: "danger",
      cancelText: "取消",
      content: (
        <span>
          確定要刪除「{store.storeName || `商店 ${store.id}`}
          」嗎？此操作將永久移除商店與其圖片，無法復原。
        </span>
      ),
      onCancel: () => {
        confirmOpenRef.current = false;
      },
      onOk: async () => {
        if (!idToken) {
          messageApi.error("尚未取得管理員權限，請稍後再試");
          confirmOpenRef.current = false;
          return Promise.reject();
        }
        setDeleting(store.id);
        try {
          const res = await authedFetch(idToken, `/api/stores/${store.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete store");
          setStores((previous) =>
            previous.filter((item) => item.id !== store.id),
          );
          setSelectedIds((previous) =>
            previous.filter((storeId) => storeId !== store.id),
          );
          setActiveStoreId((previous) =>
            previous === store.id ? null : previous,
          );
          messageApi.success("商店已刪除");
          confirmOpenRef.current = false;
        } catch {
          messageApi.error("刪除失敗，請稍後再試");
          // keep the modal open so the admin can retry; ref stays true.
          return Promise.reject();
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  const columns: TableProps<Store>["columns"] = [
    {
      title: "店名",
      dataIndex: "storeName",
      key: "storeName",
      render: (_, { storeName }) => (
        <span className="font-semibold">{storeName || "—"}</span>
      ),
    },
    {
      title: "狀態",
      dataIndex: "status",
      key: "status",
      render: (_, { status }) => {
        const resolvedStatus = status ?? STORE_STATUS.PENDING;
        return (
          <Tag color={STATUS_COLOR[resolvedStatus]}>
            {STATUS_LABEL[resolvedStatus]}
          </Tag>
        );
      },
    },
    {
      title: "類型",
      key: "listingType",
      render: (_, store) => {
        const listingType = listingTypeOf(store);
        return (
          <Tag color={LISTING_TYPE_COLOR[listingType]}>
            {LISTING_TYPE_LABEL[listingType]}
          </Tag>
        );
      },
    },
    {
      title: "城市／類型",
      dataIndex: "city",
      key: "city",
      // * digital assets have no city — show their asset types instead
      render: (_, store) =>
        (isDigitalAsset(store)
          ? formatDigitalTypes(store.digitalTypes)
          : store.city) || "—",
    },
    {
      title: "區域",
      dataIndex: "district",
      key: "district",
      render: (_, { district }) => district || "—",
    },
    {
      title: "類別",
      dataIndex: "category",
      key: "category",
      render: (_, { category }) =>
        STORE_CATEGORIES.find((item) => item.key === category)?.label ??
        (category || "—"),
    },
    {
      title: "頂讓金",
      dataIndex: "price",
      key: "price",
      align: "right",
      sorter: (left, right) => (left.price ?? 0) - (right.price ?? 0),
      render: (_, record) =>
        formatPriceRange(record.price, record.priceMax, record.priceNegotiable),
    },
    {
      title: "坪數",
      dataIndex: "areaPing",
      key: "areaPing",
      align: "right",
      render: (_, { areaPing }) => areaPing ?? "—",
    },
    {
      title: "月租",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right",
      render: (_, { monthlyRent }) =>
        monthlyRent ? monthlyRent.toLocaleString() : "—",
    },
    {
      title: (
        <Tooltip title={`自 ${PAGE_VIEW_TRACKING_START} 開始追蹤起累計`}>
          <span className="whitespace-nowrap">總瀏覽數</span>
        </Tooltip>
      ),
      key: "totalViews",
      align: "right",
      showSorterTooltip: false,
      sorter: (left, right) =>
        allTimeOf(left.id).views - allTimeOf(right.id).views,
      render: (_, { id }) => {
        if (analyticsLoading && !analytics) {
          return (
            <Skeleton.Input
              active
              size="small"
              className="!w-[48px] !min-w-0"
            />
          );
        }
        if (!analytics) return "—";
        const { views } = allTimeOf(id);
        if (!views) return <span className="tabular-nums">0</span>;
        return (
          // Opens this store's trend on Store Analytics; the click must not
          // also open the row drawer.
          <Link
            href={`/admin/store/analytics?store=${id}`}
            onClick={(event) => event.stopPropagation()}
            className="tabular-nums"
          >
            {views.toLocaleString()}
          </Link>
        );
      },
    },
    {
      title: (
        <Tooltip
          title={`累計點擊解鎖 ÷ 累計看到聯絡區（僅未登入訪客）。自 ${CONTACT_GATE_TRACKING_START} 開始記錄，之前沒有資料。`}
        >
          <span className="whitespace-nowrap">累計解鎖聯絡點擊率</span>
        </Tooltip>
      ),
      key: "totalClickRate",
      align: "right",
      showSorterTooltip: false,
      // Stores without contact-gate views sort below a 0% rate.
      sorter: (left, right) =>
        (clickRateOf(allTimeOf(left.id)) ?? -1) -
        (clickRateOf(allTimeOf(right.id)) ?? -1),
      render: (_, { id }) => {
        if (analyticsLoading && !analytics) {
          return (
            <Skeleton.Input
              active
              size="small"
              className="!w-[72px] !min-w-0"
            />
          );
        }
        if (!analytics) return "—";
        return <ClickRate {...allTimeOf(id)} showCounts />;
      },
    },
    {
      title: "建立",
      dataIndex: "createTime",
      key: "createTime",
      sorter: (left, right) =>
        dayjs(left.createTime).valueOf() - dayjs(right.createTime).valueOf(),
      render: (_, { createTime }) => (
        <span className="whitespace-nowrap text-black/45">
          {dayjs(createTime).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "更新",
      dataIndex: "updateTime",
      key: "updateTime",
      defaultSortOrder: "descend",
      // dayjs(undefined) is "now" — sort stores missing updateTime last instead.
      sorter: (left, right) =>
        (left.updateTime ? dayjs(left.updateTime).valueOf() : 0) -
        (right.updateTime ? dayjs(right.updateTime).valueOf() : 0),
      render: (_, { updateTime }) =>
        updateTime ? (
          <span className="whitespace-nowrap text-black/45">
            {dayjs(updateTime).format("YYYY-MM-DD HH:mm")}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="p-[16px]">
      {modalHolder}
      {messageHolder}
      <Space className="mb-[12px]" wrap>
        <Input.Search
          allowClear
          placeholder="Search by store name or user ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-[320px] max-w-full"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          className="w-[128px]"
        />
        <Select
          value={listingFilter}
          onChange={setListingFilter}
          options={LISTING_FILTER_OPTIONS}
          className="w-[128px]"
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(range) => setDateRange(range)}
          placeholder={["Created from", "Created to"]}
        />
        <AntButton
          onClick={handleExport}
          loading={exporting}
          disabled={!idToken}
        >
          下載所有店家資料（CSV）
        </AntButton>
      </Space>

      {selectedIds.length > 0 && (
        <div className="mb-[12px] flex flex-wrap items-center gap-[8px] rounded-[8px] border border-solid border-[#ffd8d1] bg-[#fff1ee] px-[12px] py-[8px]">
          <span className="font-semibold">已選取 {selectedIds.length} 筆</span>
          {BULK_STATUS_ACTIONS.map((action) => (
            <AntButton
              key={action.status}
              size="small"
              disabled={bulkUpdating}
              onClick={() => handleBulkStatusChange(action.status)}
            >
              {action.label}
            </AntButton>
          ))}
          <AntButton
            size="small"
            disabled={bulkUpdating}
            onClick={() => confirmConvertToDraft(selectedIds)}
          >
            ↩ 轉為草稿
          </AntButton>
          <AntButton
            size="small"
            type="text"
            disabled={bulkUpdating}
            onClick={() => setSelectedIds([])}
          >
            取消選取
          </AntButton>
        </div>
      )}

      <Table
        size="small"
        columns={columns}
        dataSource={filteredStores}
        rowKey="id"
        loading={loading || bulkUpdating}
        scroll={{ x: 1280 }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as string[]),
        }}
        onRow={(record) => ({
          onClick: (event) => {
            // Ticking a checkbox selects the row; it shouldn't open the drawer.
            const target = event.target as HTMLElement;
            if (target.closest(".ant-table-selection-column")) return;
            setActiveStoreId(record.id);
          },
        })}
        rowClassName={(record) =>
          cn(
            "cursor-pointer",
            record.id === activeStoreId && "[&>td]:!bg-[#fff1ee]",
          )
        }
      />

      <StoreDetailDrawer
        store={activeStore}
        deleting={deleting === activeStoreId}
        statusSection={
          activeStore && (
            <StoreStatusControls
              store={activeStore}
              statusUpdating={updating === activeStoreId}
              onStatusChange={handleStatusChange}
              onConvertToDraft={(store) => confirmConvertToDraft([store.id])}
            />
          )
        }
        onClose={() => setActiveStoreId(null)}
        onDelete={handleDelete}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
}

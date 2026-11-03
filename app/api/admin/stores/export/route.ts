import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { getStoresForExport } from "@/firebase/serverUtils/store";
import { STORE_STATUS } from "@/types";
import { listingTypeOf } from "@/utils/store";
import { exportFileName, toStoreCsv } from "@/utils/storeCsv";

// * seller contact data — never cache or prerender this response
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { decoded, error } = await verifyAdminToken(req);
  if (error) return error;

  try {
    // * same defaults the admin store list shows: missing status = pending,
    // * missing listingType = physical
    const stores = (await getStoresForExport()).map((store) => ({
      ...store,
      status: store.status ?? STORE_STATUS.PENDING,
      listingType: listingTypeOf(store),
    }));
    const now = new Date();
    const csv = toStoreCsv(stores, { appUrl: APP_URL });

    // * audit trail (#99): who, when, how many rows — never the rows themselves
    console.info(
      JSON.stringify({
        event: "admin_store_export",
        adminUid: decoded.uid,
        adminEmail: decoded.email ?? "",
        rowCount: stores.length,
        exportedAt: now.toISOString(),
      }),
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportFileName(now)}"`,
        "Cache-Control": "no-store",
        "X-Row-Count": String(stores.length),
      },
    });
  } catch (err) {
    console.error("Failed to export stores", err);
    return NextResponse.json(
      { error: "Failed to export stores" },
      { status: 500 },
    );
  }
}

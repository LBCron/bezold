import Logo from "./Logo";
import Link from "@/components/refactored/Link";
import SellButton from "./SellButton";
import NavAuthStatus from "./NavAuthStatus";
import NavLaunchBadge from "./NavLaunchBadge";
import { isDigitalAssetsLaunched } from "@/utils/digitalAsset";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "我要找店", href: "/store-list" },
  { label: "數位資產", href: "/digital-assets" },
  { label: "我要頂出", href: "/sell" },
  { label: "頂讓指南", href: "/store-guide" },
  { label: "部落格", href: "/blog" },
  { label: "常見問題", href: "/faq" },
];

export default function SiteNav({ activeLink }: { activeLink?: string }) {
  const digitalAssetsLaunched = isDigitalAssetsLaunched();

  return (
    <nav
      className={cn(
        "border-b-[1.5px] border-solid border-[var(--ink)]",
        "px-7 py-3.5",
        "bg-[var(--paper)]",
      )}
    >
      <div className="flex items-center justify-between">
        <Logo />
        <ul
          className={cn(
            "text-sm font-[var(--hand)]",
            "hidden lg:flex gap-[22px]",
            "m-0 p-0",
            "list-none",
          )}
        >
          {navLinks.map(({ label, href }) => (
            <Link href={href} key={label} active={label === activeLink}>
              {label}
              {/* desktop row only — the mobile row has no room for it */}
              {href === "/digital-assets" && (
                <NavLaunchBadge serverLaunched={digitalAssetsLaunched} />
              )}
            </Link>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <NavAuthStatus />
          <SellButton />
        </div>
      </div>

      {/* Second nav row below lg — six links don't fit beside the logo and
          the auth buttons until ~850px. On phones a smaller size and a little
          of the nav's side padding keep them apart at 375px. */}
      <ul
        className={cn(
          "flex lg:hidden justify-between sm:justify-center sm:gap-8",
          "-mx-3 sm:mx-0 p-0 mb-0 mt-2.5 pt-2.5 list-none",
          "border-t border-dashed border-[var(--ink-2)]",
          "text-[13px] sm:text-sm",
        )}
      >
        {navLinks.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} active={label === activeLink}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

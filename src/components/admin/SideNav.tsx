"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

type Item = { href: string; label: string; icon: string; also?: string[] };
type Groups = { label: string; items: Item[] }[];

function NavList({ groups, pathname }: { groups: Groups; pathname: string | null }) {
  return (
    <nav>
      {groups.map((g) => (
        <div key={g.label}>
          <div className="side-label">{g.label}</div>
          {g.items.map((item) => {
            const active =
              pathname != null &&
              (item.href === "/admin"
                ? pathname === "/admin"
                : [item.href, ...(item.also ?? [])].some((prefix) => pathname.startsWith(prefix)));
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function ActiveNav({ groups }: { groups: Groups }) {
  return <NavList groups={groups} pathname={usePathname()} />;
}

/** Menu samping; tanpa penanda aktif di static shell, lalu disorot setelah URL diketahui. */
export function SideNav({ groups }: { groups: Groups }) {
  return (
    <Suspense fallback={<NavList groups={groups} pathname={null} />}>
      <ActiveNav groups={groups} />
    </Suspense>
  );
}

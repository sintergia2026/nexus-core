"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  usePathname,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/internal-records-view", label: "Internal Records" },
  { href: "/diagnostics-view", label: "Diagnostics" },
  { href: "/executive-report", label: "Executive Report" },
];

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function buildHrefWithCurrentQuery(
  href: string,
  searchParams: ReadonlyURLSearchParams
): string {
  const query = searchParams.toString();
  return query ? `${href}?${query}` : href;
}

function AppShellInner({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}>NEXUS™ Runtime</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const href = buildHrefWithCurrentQuery(item.href, searchParams);

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`${styles.navItem} ${
                    active ? styles.navItemActive : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}

export default function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading interface...</div>}>
      <AppShellInner {...props} />
    </Suspense>
  );
}
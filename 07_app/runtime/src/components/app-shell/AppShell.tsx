"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/internal-records-view", label: "Internal Records" },
  { href: "/diagnostics-view", label: "Diagnostics" },
  { href: "/executive-report", label: "Executive Report" },
];

function buildHrefWithCurrentQuery(
  href: string,
  searchParams: URLSearchParams
): string {
  const query = searchParams.toString();
  return query ? `${href}?${query}` : href;
}

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
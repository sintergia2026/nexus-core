import Link from "next/link";
import styles from "./ContextSwitcher.module.css";
import { RuntimeContext } from "@/lib/runtime-context";

const PRESETS: Array<{
  label: string;
  context: RuntimeContext;
}> = [
  {
    label: "Demo / site-004 / W11",
    context: {
      organizationId: "org-sintergia-demo",
      siteId: "site-004",
      weekId: "site-004::2026-W11",
    },
  },
  {
    label: "Solo default",
    context: {
      organizationId: "org-sintergia-demo",
      siteId: "site-004",
      weekId: "site-004::2026-W11",
    },
  },
];

function buildHref(pathname: string, context: RuntimeContext): string {
  const qs = new URLSearchParams({
    organizationId: context.organizationId,
    siteId: context.siteId,
    weekId: context.weekId,
  });

  return `${pathname}?${qs.toString()}`;
}

export default function ContextSwitcher({
  pathname,
  current,
}: {
  pathname: string;
  current: RuntimeContext;
}) {
  return (
    <section className={styles.wrap}>
      <div className={styles.heading}>Context Switcher</div>

      <div className={styles.current}>
        <div className={styles.item}>
          <div className={styles.label}>Organization</div>
          <div>{current.organizationId}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>Site</div>
          <div>{current.siteId}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>Week</div>
          <div>{current.weekId}</div>
        </div>
      </div>

      <div className={styles.presets}>
        {PRESETS.map((preset) => (
          <Link
            key={`${preset.context.organizationId}-${preset.context.siteId}-${preset.context.weekId}-${preset.label}`}
            href={buildHref(pathname, preset.context)}
            className={styles.preset}
          >
            {preset.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
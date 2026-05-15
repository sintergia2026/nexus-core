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
  availableContexts,
}: {
  pathname: string;
  current: RuntimeContext;
  availableContexts?: RuntimeContext[];
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
        {availableContexts && availableContexts.length > 0
          ? availableContexts.map((ctx) => (
              <Link
                key={`${ctx.organizationId}::${ctx.siteId}::${ctx.weekId}`}
                href={buildHref(pathname, ctx)}
                className={styles.preset}
              >
                {`${ctx.siteId} / ${ctx.weekId}`}
              </Link>
            ))
          : PRESETS.map((preset) => (
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
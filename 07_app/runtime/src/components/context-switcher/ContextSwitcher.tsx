import Link from "next/link";
import styles from "./ContextSwitcher.module.css";
import { RuntimeContext } from "@/lib/runtime-context";

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
  current: RuntimeContext | null;
  availableContexts?: RuntimeContext[];
}) {
  return (
    <section className={styles.wrap}>
      <div className={styles.heading}>Active Context</div>

      <div className={styles.current}>
        {current === null ? (
          <div className={styles.item}>
            <div className={styles.label}>No context selected</div>
          </div>
        ) : (
          <>
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
          </>
        )}
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
          : <div className={styles.label}>No persisted contexts available.</div>}
      </div>
    </section>
  );
}
import AppShell from "@/components/app-shell/AppShell";
import ContextSwitcher from "@/components/context-switcher/ContextSwitcher";
import Chips from "@/components/ui/Chips";
import Row from "@/components/ui/Row";
import styles from "../internal-records-view/page.module.css";
import {
  ActiveDiagnosticEnvelope,
  getActiveDiagnosticByContext,
} from "@/lib/internal-records-client";
import { resolveRuntimeContext } from "@/lib/runtime-context";

function metricValue(
  metrics: Array<{ code: string; value: number | string }>,
  code: string
): string {
  const metric = metrics.find((m) => m.code === code);
  return metric ? String(metric.value) : "n/a";
}

export default async function DiagnosticsViewPage({
  searchParams,
}: {
  searchParams?: Promise<{
    organizationId?: string;
    siteId?: string;
    weekId?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const context = resolveRuntimeContext(resolvedSearchParams);

  const envelope = await getActiveDiagnosticByContext(context);

  return (
    <AppShell
      title="NEXUS™ Diagnostics View"
      subtitle="Framework-native diagnostic surface for active system posture, constraints, and metric state."
    >
      <ContextSwitcher pathname="/diagnostics-view" current={context} />

      {envelope.error || !envelope.found || !envelope.diagnostic ? (
        <section className={styles.card}>
          <div className={styles.error}>
            Active diagnostic could not be loaded.
          </div>
        </section>
      ) : (
        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Block A — Diagnostic Posture</h2>
            <div className={styles.meta}>servedAt: {envelope.servedAt}</div>

            <Row label="Persisted Bundle ID">
              <div className={styles.mutedMono}>
                {envelope.diagnostic.persistedBundleId}
              </div>
            </Row>
            <Row label="Record Status">{envelope.diagnostic.recordStatus}</Row>
            <Row label="State">{envelope.diagnostic.stateLabel}</Row>
            <Row label="Decision">{envelope.diagnostic.decisionLabel}</Row>
            <Row label="Priority">{envelope.diagnostic.priority}</Row>
            <Row label="Stored At">{envelope.diagnostic.storedAt}</Row>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              Block B — Active Signals & Constraints
            </h2>
            <div className={styles.meta}>diagnostic surface</div>

            <Row label="Signals">
              <Chips
                values={envelope.diagnostic.activeSignals.map(
                  (signal) =>
                    `${signal.code}${signal.severity ? `:${signal.severity}` : ""}`
                )}
              />
            </Row>

            <Row label="Constraints">
              <Chips
                values={envelope.diagnostic.activeConstraints.map(
                  (constraint) => `${constraint.code}:${constraint.severity}`
                )}
              />
            </Row>
          </section>

          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Block C — Metric Overview</h2>
            <div className={styles.meta}>active snapshot metric surface</div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <Row label="throughput">
                  {metricValue(envelope.diagnostic.metrics, "throughput")}
                </Row>
                <Row label="utilization">
                  {metricValue(envelope.diagnostic.metrics, "utilization")}
                </Row>
                <Row label="latency">
                  {metricValue(envelope.diagnostic.metrics, "latency")}
                </Row>
                <Row label="revenue_leakage">
                  {metricValue(envelope.diagnostic.metrics, "revenue_leakage")}
                </Row>
                <Row label="staffing_pressure">
                  {metricValue(envelope.diagnostic.metrics, "staffing_pressure")}
                </Row>
                <Row label="reporting_reliability">
                  {metricValue(
                    envelope.diagnostic.metrics,
                    "reporting_reliability"
                  )}
                </Row>
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
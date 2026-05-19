import AppShell from "@/components/app-shell/AppShell";
import ContextSwitcher from "@/components/context-switcher/ContextSwitcher";
import Chips from "@/components/ui/Chips";
import Row from "@/components/ui/Row";
import styles from "./page.module.css";
import {
  ActiveDiagnosticEnvelope,
  getActiveDiagnosticByContext,
  getAvailableContexts,
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
  const resolution = resolveRuntimeContext(resolvedSearchParams);

  if (resolution.status === "unresolved") {
    const availableContextsEnvelope = await getAvailableContexts();
    return (
      <AppShell
        title="NEXUS™ Posture"
        subtitle="Active signals, governing constraints, and metric state for the selected context."
      >
        <ContextSwitcher
          pathname="/diagnostics-view"
          current={null}
          availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
        />
        <section className={styles.card}>
          <div className={styles.empty}>
            No context selected. Choose a context from the panel above.
          </div>
        </section>
      </AppShell>
    );
  }

  const context = resolution.context;

  const [envelope, availableContextsEnvelope] = await Promise.all([
    getActiveDiagnosticByContext(context),
    getAvailableContexts(),
  ]);

  return (
    <AppShell
      title="NEXUS™ Diagnostics View"
      subtitle="Framework-native diagnostic surface for active system posture, constraints, and metric state."
    >
      <ContextSwitcher
        pathname="/diagnostics-view"
        current={context}
        availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
      />

      {envelope.error || !envelope.found || !envelope.diagnostic ? (
        <section className={styles.card}>
          <div className={styles.error}>
            Active diagnostic could not be loaded.
          </div>
        </section>
      ) : (
        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Current Posture</h2>

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
            <h2 className={styles.cardTitle}>Active Signals & Constraints</h2>

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
            <h2 className={styles.cardTitle}>Metric Overview</h2>

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
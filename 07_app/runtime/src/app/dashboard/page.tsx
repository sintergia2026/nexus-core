import AppShell from "@/components/app-shell/AppShell";
import ContextSwitcher from "@/components/context-switcher/ContextSwitcher";
import Chips from "@/components/ui/Chips";
import ChangeFlag from "@/components/ui/ChangeFlag";
import Row from "@/components/ui/Row";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "../internal-records-view/page.module.css";
import {
  ActiveDiagnosticEnvelope,
  ComparisonEnvelope,
  getActiveRecordSummaryByContext,
  queryRecordSummaries,
  getActiveDiagnosticByContext,
  compareRecordsById,
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

export default async function DashboardPage({
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
        title="NEXUS™ Dashboard"
        subtitle="Framework-native composition surface for governing snapshot, diagnostics, history, and comparison."
      >
        <ContextSwitcher
          pathname="/dashboard"
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

  const [activeEnvelope, historyEnvelope, diagnosticEnvelope, availableContextsEnvelope] =
    await Promise.all([
      getActiveRecordSummaryByContext(context),
      queryRecordSummaries(context),
      getActiveDiagnosticByContext(context),
      getAvailableContexts(),
    ]);

  const activeRecord = activeEnvelope.record;
  const diagnostic = diagnosticEnvelope.diagnostic;

  const historyRecords = [...(historyEnvelope.records ?? [])].sort((a, b) => {
    if (a.recordStatus !== b.recordStatus) {
      if (a.recordStatus === "active") return -1;
      if (b.recordStatus === "active") return 1;
    }
    return String(b.storedAt).localeCompare(String(a.storedAt));
  });

  const comparisonEnvelope: ComparisonEnvelope | null =
    historyRecords.length >= 2
      ? await compareRecordsById({
          leftRecordId: historyRecords[1].persistedBundleId,
          rightRecordId: historyRecords[0].persistedBundleId,
        })
      : null;

  return (
    <AppShell
      title="NEXUS™ Dashboard"
      subtitle="Framework-native composition surface for governing snapshot, diagnostics, history, and comparison."
    >
      <ContextSwitcher
        pathname="/dashboard"
        current={context}
        availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
      />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Block A — Governing Snapshot</h2>
          <div className={styles.meta}>
            servedAt: {activeEnvelope.servedAt || "unknown"}
          </div>

          {activeEnvelope.error || !activeEnvelope.found || !activeRecord ? (
            <div className={styles.error}>
              Active governing snapshot could not be loaded.
            </div>
          ) : (
            <>
              <Row label="Persisted Bundle ID">
                <div className={styles.mutedMono}>
                  {activeRecord.persistedBundleId}
                </div>
              </Row>
              <Row label="Status">
                <StatusBadge status={activeRecord.recordStatus} />
              </Row>
              <Row label="State">{activeRecord.stateLabel}</Row>
              <Row label="Decision">{activeRecord.decisionLabel}</Row>
              <Row label="Priority">{activeRecord.priority}</Row>
              <Row label="Stored At">{activeRecord.storedAt}</Row>
            </>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Block B — Diagnostic Risk Surface</h2>
          <div className={styles.meta}>
            servedAt: {diagnosticEnvelope.servedAt || "unknown"}
          </div>

          {diagnosticEnvelope.error || !diagnosticEnvelope.found || !diagnostic ? (
            <div className={styles.error}>
              Active diagnostic could not be loaded.
            </div>
          ) : (
            <>
              <Row label="Signals">
                <Chips
                  values={diagnostic.activeSignals.map(
                    (signal) =>
                      `${signal.code}${
                        signal.severity ? `:${signal.severity}` : ""
                      }`
                  )}
                />
              </Row>
              <Row label="Constraints">
                <Chips
                  values={diagnostic.activeConstraints.map(
                    (constraint) => `${constraint.code}:${constraint.severity}`
                  )}
                />
              </Row>
              <Row label="reporting_reliability">
                {metricValue(diagnostic.metrics, "reporting_reliability")}
              </Row>
              <Row label="revenue_leakage">
                {metricValue(diagnostic.metrics, "revenue_leakage")}
              </Row>
              <Row label="latency">
                {metricValue(diagnostic.metrics, "latency")}
              </Row>
            </>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Block C — Historical Chain</h2>
          <div className={styles.meta}>
            resultCount: {historyEnvelope.resultCount ?? 0} | servedAt:{" "}
            {historyEnvelope.servedAt || "unknown"}
          </div>

          {historyEnvelope.error ? (
            <div className={styles.error}>
              Historical chain could not be loaded.
            </div>
          ) : historyRecords.length === 0 ? (
            <div className={styles.empty}>No historical records found.</div>
          ) : (
            <div className={styles.list}>
              {historyRecords.map((record) => (
                <div key={record.persistedBundleId} className={styles.listItem}>
                  <div className={styles.listItemTop}>
                    <div className={styles.mutedMono}>
                      {record.persistedBundleId}
                    </div>
                    <StatusBadge status={record.recordStatus} />
                  </div>
                  <Row label="State">{record.stateLabel}</Row>
                  <Row label="Decision">{record.decisionLabel}</Row>
                  <Row label="Priority">{record.priority}</Row>
                  <Row label="Stored At">{record.storedAt}</Row>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Block D — Comparison Executive Reading
          </h2>
          <div className={styles.meta}>
            servedAt: {comparisonEnvelope?.servedAt || "unknown"}
          </div>

          {!comparisonEnvelope ? (
            <div className={styles.empty}>
              Comparison requires at least two records for this context.
            </div>
          ) : comparisonEnvelope.error ? (
            <div className={styles.error}>
              Comparison executive block could not be loaded.
            </div>
          ) : (
            <>
              <div className={styles.exec}>
                {comparisonEnvelope.executiveReading}
              </div>

              <div className={styles.flagGrid} style={{ marginTop: 16 }}>
                <ChangeFlag
                  label="State changed"
                  changed={
                    comparisonEnvelope.postureComparison.stateLabelChanged
                  }
                />
                <ChangeFlag
                  label="Decision changed"
                  changed={
                    comparisonEnvelope.postureComparison.decisionLabelChanged
                  }
                />
                <ChangeFlag
                  label="Priority changed"
                  changed={comparisonEnvelope.postureComparison.priorityChanged}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
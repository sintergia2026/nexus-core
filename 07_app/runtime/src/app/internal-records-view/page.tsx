import AppShell from "@/components/app-shell/AppShell";
import ContextSwitcher from "@/components/context-switcher/ContextSwitcher";
import Chips from "@/components/ui/Chips";
import ChangeFlag from "@/components/ui/ChangeFlag";
import Row from "@/components/ui/Row";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./page.module.css";
import {
  ComparisonEnvelope,
  MultiRecordSummaryEnvelope,
  SingleRecordSummaryEnvelope,
  getActiveRecordSummaryByContext,
  queryRecordSummaries,
  compareRecordsById,
  getAvailableContexts,
} from "@/lib/internal-records-client";
import { resolveRuntimeContext } from "@/lib/runtime-context";

function truncateId(value: string, head = 28, tail = 14): string {
  if (value.length <= head + tail + 3) {
    return value;
  }
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export default async function InternalRecordsViewPage({
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
        title="NEXUS™ Internal Records View"
        subtitle="Framework-native records surface for active summary, historical summaries, and comparison."
      >
        <ContextSwitcher
          pathname="/internal-records-view"
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

  const [activeEnvelope, historyEnvelope, availableContextsEnvelope] = await Promise.all([
    getActiveRecordSummaryByContext(context),
    queryRecordSummaries(context),
    getAvailableContexts(),
  ]);

  const activeRecord = activeEnvelope.record;
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
      title="NEXUS™ Internal Records View"
      subtitle="Framework-native records surface for active summary, historical summaries, and comparison."
    >
      <ContextSwitcher
        pathname="/internal-records-view"
        current={context}
        availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
      />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Block A — Active Record Summary</h2>
          <div className={styles.meta}>
            servedAt: {activeEnvelope.servedAt || "unknown"}
          </div>

          {!activeEnvelope.found || activeEnvelope.error || !activeRecord ? (
            <div className={styles.error}>
              Active record not available for this context.
            </div>
          ) : (
            <div>
              <Row label="Persisted Bundle ID">
                <div
                  className={styles.mono}
                  title={activeRecord.persistedBundleId}
                >
                  {truncateId(activeRecord.persistedBundleId)}
                </div>
                <div className={styles.mutedMono}>
                  {activeRecord.persistedBundleId}
                </div>
              </Row>
              <Row label="Status">
                <StatusBadge status={activeRecord.recordStatus} />
              </Row>
              <Row label="Context">
                {activeRecord.organizationId} / {activeRecord.siteId} /{" "}
                {activeRecord.weekId}
              </Row>
              <Row label="State">{activeRecord.stateLabel}</Row>
              <Row label="Decision">{activeRecord.decisionLabel}</Row>
              <Row label="Priority">{activeRecord.priority}</Row>
              <Row label="Active Signals">
                <Chips values={activeRecord.activeSignals} />
              </Row>
              <Row label="Active Constraints">
                <Chips values={activeRecord.activeConstraints} />
              </Row>
              <Row label="Stored At">{activeRecord.storedAt}</Row>
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Block B — Historical Record Summaries
          </h2>
          <div className={styles.meta}>
            resultCount: {historyEnvelope.resultCount ?? 0} | servedAt:{" "}
            {historyEnvelope.servedAt || "unknown"}
          </div>

          {historyEnvelope.error ? (
            <div className={styles.error}>
              Historical record list could not be loaded.
            </div>
          ) : historyRecords.length === 0 ? (
            <div className={styles.empty}>No historical records found.</div>
          ) : (
            <div className={styles.list}>
              {historyRecords.map((record) => (
                <div key={record.persistedBundleId} className={styles.listItem}>
                  <div className={styles.listItemTop}>
                    <div>
                      <div
                        className={styles.mono}
                        title={record.persistedBundleId}
                      >
                        {truncateId(record.persistedBundleId)}
                      </div>
                      <div className={styles.mutedMono}>
                        {record.persistedBundleId}
                      </div>
                    </div>
                    <StatusBadge status={record.recordStatus} />
                  </div>

                  <Row label="Week">{record.weekId}</Row>
                  <Row label="State">{record.stateLabel}</Row>
                  <Row label="Decision">{record.decisionLabel}</Row>
                  <Row label="Priority">{record.priority}</Row>
                  <Row label="Stored At">{record.storedAt}</Row>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Block C — Comparison Panel</h2>
          <div className={styles.meta}>
            servedAt: {comparisonEnvelope?.servedAt || "unknown"}
          </div>

          {!comparisonEnvelope ? (
            <div className={styles.empty}>
              Comparison requires at least two records for this context.
            </div>
          ) : comparisonEnvelope.error ? (
            <div className={styles.error}>Comparison could not be completed.</div>
          ) : (
            <div className={styles.delta}>
              <div className={styles.exec}>
                {comparisonEnvelope.executiveReading}
              </div>

              <div className={styles.flagGrid}>
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

              <div className={styles.deltaBlock}>
                <h3 className={styles.blockHeading}>Posture Comparison</h3>
                <Row label="Left Status">
                  {comparisonEnvelope.contextSummary.left.recordStatus}
                </Row>
                <Row label="Right Status">
                  {comparisonEnvelope.contextSummary.right.recordStatus}
                </Row>
                <Row label="Left State">
                  {comparisonEnvelope.postureComparison.leftStateLabel}
                </Row>
                <Row label="Right State">
                  {comparisonEnvelope.postureComparison.rightStateLabel}
                </Row>
                <Row label="Left Decision">
                  {comparisonEnvelope.postureComparison.leftDecisionLabel}
                </Row>
                <Row label="Right Decision">
                  {comparisonEnvelope.postureComparison.rightDecisionLabel}
                </Row>
                <Row label="Left Priority">
                  {comparisonEnvelope.postureComparison.leftPriority}
                </Row>
                <Row label="Right Priority">
                  {comparisonEnvelope.postureComparison.rightPriority}
                </Row>
              </div>

              <div className={styles.deltaBlock}>
                <h3 className={styles.blockHeading}>Signal Comparison</h3>
                <Row label="Left Active Signals">
                  <Chips
                    values={comparisonEnvelope.signalComparison.leftActiveSignals}
                  />
                </Row>
                <Row label="Right Active Signals">
                  <Chips
                    values={
                      comparisonEnvelope.signalComparison.rightActiveSignals
                    }
                  />
                </Row>
                <Row label="Added Signals">
                  <Chips values={comparisonEnvelope.signalComparison.addedSignals} />
                </Row>
                <Row label="Removed Signals">
                  <Chips
                    values={comparisonEnvelope.signalComparison.removedSignals}
                  />
                </Row>
              </div>

              <div className={styles.deltaBlock}>
                <h3 className={styles.blockHeading}>Constraint Comparison</h3>
                <Row label="Left Active Constraints">
                  <Chips
                    values={
                      comparisonEnvelope.constraintComparison.leftActiveConstraints
                    }
                  />
                </Row>
                <Row label="Right Active Constraints">
                  <Chips
                    values={
                      comparisonEnvelope.constraintComparison.rightActiveConstraints
                    }
                  />
                </Row>
                <Row label="Added Constraints">
                  <Chips
                    values={
                      comparisonEnvelope.constraintComparison.addedConstraints
                    }
                  />
                </Row>
                <Row label="Removed Constraints">
                  <Chips
                    values={
                      comparisonEnvelope.constraintComparison.removedConstraints
                    }
                  />
                </Row>
              </div>

              <div className={styles.deltaBlock}>
                <h3 className={styles.blockHeading}>Metric Differences</h3>
                {comparisonEnvelope.metricDifferences.length === 0 ? (
                  <div className={styles.empty}>
                    No metric differences detected.
                  </div>
                ) : (
                  <div className={styles.list}>
                    {comparisonEnvelope.metricDifferences.map((metric) => (
                      <div key={metric.code} className={styles.listItem}>
                        <Row label="Metric">{metric.code}</Row>
                        <Row label="Left">{String(metric.leftValue)}</Row>
                        <Row label="Right">{String(metric.rightValue)}</Row>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
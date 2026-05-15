import AppShell from "@/components/app-shell/AppShell";
import ContextSwitcher from "@/components/context-switcher/ContextSwitcher";
import Row from "@/components/ui/Row";
import Chips from "@/components/ui/Chips";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "../internal-records-view/page.module.css";
import {
  ActiveDiagnosticEnvelope,
  SingleRecordSummaryEnvelope,
  getActiveRecordSummaryByContext,
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

function metricNumber(
  metrics: Array<{ code: string; value: number | string }>,
  code: string
): number {
  const metric = metrics.find((m) => m.code === code);
  if (!metric) return 0;
  const parsed = Number(metric.value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function reportingRiskLabel(value: number): string {
  if (value < 40) return "Critical";
  if (value < 70) return "Weak";
  return "Acceptable";
}

function latencyLabel(value: number): string {
  if (value >= 15) return "Elevated";
  if (value >= 10) return "Moderate";
  return "Controlled";
}

export default async function ExecutiveReportPage({
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

  const [activeEnvelope, diagnosticEnvelope, availableContextsEnvelope] = await Promise.all([
    getActiveRecordSummaryByContext(context),
    getActiveDiagnosticByContext(context),
    getAvailableContexts(),
  ]);

  const activeRecord = activeEnvelope.record;
  const diagnostic = diagnosticEnvelope.diagnostic;

  const activeSignals =
    diagnostic?.activeSignals.map(
      (signal) => `${signal.code}${signal.severity ? `:${signal.severity}` : ""}`
    ) ?? [];

  const activeConstraints =
    diagnostic?.activeConstraints.map(
      (constraint) => `${constraint.code}:${constraint.severity}`
    ) ?? [];

  const revenueLeakage = diagnostic ? metricNumber(diagnostic.metrics, "revenue_leakage") : 0;
  const reportingReliability = diagnostic
    ? metricNumber(diagnostic.metrics, "reporting_reliability")
    : 0;
  const latency = diagnostic ? metricNumber(diagnostic.metrics, "latency") : 0;
  const throughput = diagnostic ? metricNumber(diagnostic.metrics, "throughput") : 0;
  const utilization = diagnostic ? metricNumber(diagnostic.metrics, "utilization") : 0;

  return (
    <AppShell
      title="NEXUS™ Executive Report"
      subtitle="Business-facing executive interpretation layer above the NEXUS diagnostic core."
    >
      <ContextSwitcher
        pathname="/executive-report"
        current={context}
        availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
      />

      {!activeEnvelope.found ||
      activeEnvelope.error ||
      !activeRecord ||
      diagnosticEnvelope.error ||
      !diagnosticEnvelope.found ||
      !diagnostic ? (
        <section className={styles.card}>
          <div className={styles.error}>
            Executive report could not be loaded for this context.
          </div>
        </section>
      ) : (
        <div className={styles.grid}>
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>1. Executive Summary</h2>
            <div className={styles.meta}>
              servedAt: {activeEnvelope.servedAt || "unknown"}
            </div>

            <p>
              During the evaluated operational week, this business is currently
              in a <strong>{activeRecord.stateLabel.toUpperCase()}</strong>{" "}
              operational state.
            </p>

            <p>
              The system detected structural weakness in the reporting and control
              layer, which is reducing decision quality and allowing inefficiencies
              to persist under active operating volume.
            </p>

            <div className={styles.list} style={{ marginTop: 16 }}>
              <div className={styles.listItem}>
                <Row label="Key Decision">{activeRecord.decisionLabel}</Row>
                <Row label="Priority">{activeRecord.priority}</Row>
                <Row label="Record Status">
                  <StatusBadge status={activeRecord.recordStatus} />
                </Row>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>2. Business Impact Interpretation</h2>
            <div className={styles.meta}>executive interpretation</div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <Row label="Revenue Leakage Level">
                  {revenueLeakage > 0 ? "Material" : "Low"}
                </Row>
                <Row label="Reporting Control Risk">
                  {reportingRiskLabel(reportingReliability)}
                </Row>
                <Row label="Operational Latency">
                  {latencyLabel(latency)}
                </Row>
                <Row label="Structural Risk Exposure">
                  {activeConstraints.length > 0 ? "High" : "Low"}
                </Row>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>3. What The System Detected</h2>
            <div className={styles.meta}>signals and constraints</div>

            <Row label="Active Signals">
              <Chips values={activeSignals} />
            </Row>
            <Row label="Active Constraints">
              <Chips values={activeConstraints} />
            </Row>
          </section>

          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>4. Core Metrics</h2>
            <div className={styles.meta}>operational reality</div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <Row label="Throughput">{throughput}</Row>
                <Row label="Utilization">{utilization}</Row>
                <Row label="Latency">{latency}</Row>
                <Row label="Revenue Leakage">{revenueLeakage}</Row>
                <Row label="Staffing Pressure">
                  {metricValue(diagnostic.metrics, "staffing_pressure")}
                </Row>
                <Row label="Reporting Reliability">{reportingReliability}</Row>
              </div>
            </div>
          </section>

          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>5. Financial Exposure This Week</h2>
            <div className={styles.meta}>money and control exposure</div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <Row label="Detected Leakage">
                  {revenueLeakage > 0 ? `$${revenueLeakage}` : "No direct leakage detected"}
                </Row>
                <Row label="Control Condition">
                  {reportingReliability < 40
                    ? "The business is operating with weak reporting control."
                    : "The reporting layer remains usable."}
                </Row>
                <Row label="Immediate Financial Reading">
                  {revenueLeakage > 0
                    ? "Money is already being lost during active operation."
                    : "No measurable direct leakage detected this week."}
                </Row>
                <Row label="Why This Matters Now">
                  The operation is still producing, but it is no longer producing
                  with reliable control.
                </Row>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>6. What This Means In Business Terms</h2>
            <div className={styles.meta}>executive reading</div>

            <div className={styles.exec}>
              This operation is active and producing volume, but it is not fully
              under control. Reporting weakness is reducing decision quality,
              making loss patterns harder to isolate, and allowing inefficiencies
              to persist across the operating week.
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>7. Immediate Actions Required</h2>
            <div className={styles.meta}>next 7 days</div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <p><strong>Owner / Manager:</strong> enforce complete daily reporting with zero missing fields before end-of-day close.</p>
                <p><strong>Shift Lead:</strong> verify that each shift submits complete operational inputs and flag discrepancies the same day.</p>
                <p><strong>Operations Review:</strong> audit where leakage is occurring and compare expected vs captured value daily for the next 7 days.</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>8. Risk If No Action Is Taken</h2>
            <div className={styles.meta}>forward risk</div>

            <div className={styles.exec}>
              If no corrective action is taken, reporting visibility will remain
              weak, revenue leakage will become harder to isolate, and the
              business will continue operating below its real control capacity.
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>9. System Position</h2>
            <div className={styles.meta}>structural judgment</div>

            <div className={styles.exec}>
              This is not a collapsed operation. But it is not a stable one
              either. The system position is: <strong>operation under structural stress</strong>.
            </div>
          </section>

          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>10. Closing Note</h2>
            <div className={styles.meta}>NEXUS interpretation layer</div>

            <div className={styles.exec}>
              This report is generated by NEXUS™, a domain-driven operational
              intelligence system designed to translate structural inefficiencies,
              governing constraints, and diagnostic posture into executive-level
              action guidance. The goal is not only to observe the business, but
              to help leadership recover control before hidden loss becomes normal.
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
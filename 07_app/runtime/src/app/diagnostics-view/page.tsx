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

  if (envelope.error || !envelope.found || !envelope.diagnostic) {
    return (
      <AppShell
        title="NEXUS™ Posture"
        subtitle="Active signals, governing constraints, and metric state for the selected context."
      >
        <ContextSwitcher
          pathname="/diagnostics-view"
          current={context}
          availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
        />
        <section className={styles.card}>
          <div className={styles.error}>
            Active diagnostic could not be loaded.
          </div>
        </section>
      </AppShell>
    );
  }

  const diagnostic = envelope.diagnostic;

  const signalGroups = {
    high: diagnostic.activeSignals.filter(
      (s) => s.severity?.toLowerCase() === "high"
    ),
    medium: diagnostic.activeSignals.filter(
      (s) => s.severity?.toLowerCase() === "medium"
    ),
    other: diagnostic.activeSignals.filter(
      (s) => !s.severity || !["high", "medium"].includes(s.severity.toLowerCase())
    ),
  };

  const constraintGroups = {
    high: diagnostic.activeConstraints.filter(
      (c) => c.severity.toLowerCase() === "high"
    ),
    medium: diagnostic.activeConstraints.filter(
      (c) => c.severity.toLowerCase() === "medium"
    ),
    other: diagnostic.activeConstraints.filter(
      (c) => !["high", "medium"].includes(c.severity.toLowerCase())
    ),
  };

  return (
    <AppShell
      title="NEXUS™ Posture"
      subtitle="Active signals, governing constraints, and metric state for the selected context."
    >
      <ContextSwitcher
        pathname="/diagnostics-view"
        current={context}
        availableContexts={availableContextsEnvelope.error ? [] : availableContextsEnvelope.contexts}
      />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Active Signals</h2>
          <div className={styles.groupCount}>
            {diagnostic.activeSignals.length} active
          </div>

          {diagnostic.activeSignals.length === 0 ? (
            <div className={styles.empty}>No active signals.</div>
          ) : (
            <>
              {signalGroups.high.length > 0 && (
                <div className={styles.severityGroup}>
                  <div className={`${styles.groupLabel} ${styles.groupLabelHigh}`}>HIGH</div>
                  <Chips values={signalGroups.high.map((s) => s.code)} />
                  {signalGroups.high.some((s) => s.message) && (
                    <div className={styles.groupNotes}>
                      {signalGroups.high
                        .filter((s) => s.message)
                        .map((s) => (
                          <div key={s.code} className={styles.mutedMono}>
                            {s.code}: {s.message}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
              {signalGroups.medium.length > 0 && (
                <div className={styles.severityGroup}>
                  <div className={`${styles.groupLabel} ${styles.groupLabelMedium}`}>MEDIUM</div>
                  <Chips values={signalGroups.medium.map((s) => s.code)} />
                  {signalGroups.medium.some((s) => s.message) && (
                    <div className={styles.groupNotes}>
                      {signalGroups.medium
                        .filter((s) => s.message)
                        .map((s) => (
                          <div key={s.code} className={styles.mutedMono}>
                            {s.code}: {s.message}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
              {signalGroups.other.length > 0 && (
                <div className={styles.severityGroup}>
                  <div className={styles.groupLabel}>OTHER</div>
                  <Chips values={signalGroups.other.map((s) => s.code)} />
                </div>
              )}
            </>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Active Constraints</h2>
          <div className={styles.groupCount}>
            {diagnostic.activeConstraints.length} active
          </div>

          {diagnostic.activeConstraints.length === 0 ? (
            <div className={styles.empty}>No active constraints.</div>
          ) : (
            <>
              {constraintGroups.high.length > 0 && (
                <div className={styles.severityGroup}>
                  <div className={`${styles.groupLabel} ${styles.groupLabelHigh}`}>HIGH</div>
                  <Chips values={constraintGroups.high.map((c) => c.code)} />
                  {constraintGroups.high.some((c) => c.description) && (
                    <div className={styles.groupNotes}>
                      {constraintGroups.high
                        .filter((c) => c.description)
                        .map((c) => (
                          <div key={c.code} className={styles.mutedMono}>
                            {c.code}: {c.description}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
              {constraintGroups.medium.length > 0 && (
                <div className={styles.severityGroup}>
                  <div className={`${styles.groupLabel} ${styles.groupLabelMedium}`}>MEDIUM</div>
                  <Chips values={constraintGroups.medium.map((c) => c.code)} />
                  {constraintGroups.medium.some((c) => c.description) && (
                    <div className={styles.groupNotes}>
                      {constraintGroups.medium
                        .filter((c) => c.description)
                        .map((c) => (
                          <div key={c.code} className={styles.mutedMono}>
                            {c.code}: {c.description}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
              {constraintGroups.other.length > 0 && (
                <div className={styles.severityGroup}>
                  <div className={styles.groupLabel}>OTHER</div>
                  <Chips values={constraintGroups.other.map((c) => c.code)} />
                  {constraintGroups.other.some((c) => c.description) && (
                    <div className={styles.groupNotes}>
                      {constraintGroups.other
                        .filter((c) => c.description)
                        .map((c) => (
                          <div key={c.code} className={styles.mutedMono}>
                            {c.code}: {c.description}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className={`${styles.card} ${styles.fullWidth}`}>
          <h2 className={styles.cardTitle}>Metric Detail</h2>

          <div className={styles.miniGrid}>
            {[
              { code: "throughput",            label: "Throughput"            },
              { code: "utilization",           label: "Utilization"           },
              { code: "latency",               label: "Latency"               },
              { code: "revenue_leakage",       label: "Revenue Leakage"       },
              { code: "staffing_pressure",     label: "Staffing Pressure"     },
              { code: "reporting_reliability", label: "Reporting Reliability" },
            ].map(({ code, label }) => (
              <div key={code} className={styles.miniCard}>
                <div className={styles.miniCardHeader}>
                  <p className={styles.miniCardTitle}>{label}</p>
                </div>
                <div className={styles.miniCardBody}>
                  <div className={styles.miniStat}>
                    <div className={styles.miniStatLabel}>Value</div>
                    <div className={styles.miniStatValue}>
                      {metricValue(diagnostic.metrics, code)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

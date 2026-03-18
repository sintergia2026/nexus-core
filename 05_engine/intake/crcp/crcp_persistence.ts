import fs from "fs";
import path from "path";
import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import { CrcpDiagnosticSnapshot } from "../../types/CrcpDiagnosticSnapshot";
import { CrcpTwinSeed } from "../../types/CrcpTwinSeed";

type PersistedCrcpArtifacts = {
  intake_path: string;
  snapshot_path: string;
  twin_seed_path: string;
};

function resolveRepoRoot(): string {
  return path.resolve(process.cwd(), "..", "..");
}

function ensureDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeTimestamp(value: string): string {
  return value.replace(/[:.]/g, "-");
}

function buildBaseFilename(
  organizationId: string,
  sector: string,
  capturedAt: string
): string {
  return `${organizationId}__${sector}__${safeTimestamp(capturedAt)}.json`;
}

export function persistCrcpArtifacts(
  intake: CrcpIntakePayload,
  snapshot: CrcpDiagnosticSnapshot,
  twinSeed: CrcpTwinSeed
): PersistedCrcpArtifacts {
  const repoRoot = resolveRepoRoot();

  const baseDir = path.join(repoRoot, "06_data", "crcp");
  const intakesDir = path.join(baseDir, "intakes");
  const snapshotsDir = path.join(baseDir, "snapshots");
  const twinSeedsDir = path.join(baseDir, "twin_seeds");

  ensureDirectory(intakesDir);
  ensureDirectory(snapshotsDir);
  ensureDirectory(twinSeedsDir);

  const filename = buildBaseFilename(
    intake.context.organization_id,
    intake.context.sector,
    intake.captured_at
  );

  const intakePath = path.join(intakesDir, filename);
  const snapshotPath = path.join(snapshotsDir, filename);
  const twinSeedPath = path.join(twinSeedsDir, filename);

  fs.writeFileSync(intakePath, JSON.stringify(intake, null, 2), "utf-8");
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf-8");
  fs.writeFileSync(twinSeedPath, JSON.stringify(twinSeed, null, 2), "utf-8");

  return {
    intake_path: intakePath,
    snapshot_path: snapshotPath,
    twin_seed_path: twinSeedPath,
  };
}
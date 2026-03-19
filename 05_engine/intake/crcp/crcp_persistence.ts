import fs from "fs";
import path from "path";
import { CrcpIntakePayload } from "../../types/CrcpIntakePayload";
import { CrcpDiagnosticSnapshot } from "../../types/CrcpDiagnosticSnapshot";
import { CrcpTwinSeed } from "../../types/CrcpTwinSeed";

export interface CrcpPersistenceResult {
  intake_path: string;
  snapshot_path: string;
  twin_seed_path: string;
}

function resolveRepoRoot(): string {
  return path.resolve(process.cwd(), "..", "..");
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeTimestamp(timestamp: string): string {
  return timestamp.replace(/[:.]/g, "-");
}

function buildArtifactBaseName(intake: CrcpIntakePayload): string {
  const organizationId = intake.context.organization_id || "unknown-org";
  const sector = intake.context.sector || "unknown-sector";
  const capturedAt = sanitizeTimestamp(
    intake.captured_at || new Date().toISOString()
  );

  return `${organizationId}__${sector}__${capturedAt}`;
}

export function persistCrcpArtifacts(input: {
  intake: CrcpIntakePayload;
  snapshot: CrcpDiagnosticSnapshot;
  twinSeed: CrcpTwinSeed;
}): CrcpPersistenceResult {
  const { intake, snapshot, twinSeed } = input;

  const repoRoot = resolveRepoRoot();

  const intakeDir = path.join(repoRoot, "06_data", "crcp", "intakes");
  const snapshotDir = path.join(repoRoot, "06_data", "crcp", "snapshots");
  const twinSeedDir = path.join(repoRoot, "06_data", "crcp", "twin_seeds");

  ensureDir(intakeDir);
  ensureDir(snapshotDir);
  ensureDir(twinSeedDir);

  const baseName = buildArtifactBaseName(intake);

  const intakePath = path.join(intakeDir, `${baseName}.json`);
  const snapshotPath = path.join(snapshotDir, `${baseName}.json`);
  const twinSeedPath = path.join(twinSeedDir, `${baseName}.json`);

  fs.writeFileSync(intakePath, JSON.stringify(intake, null, 2), "utf-8");
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf-8");
  fs.writeFileSync(twinSeedPath, JSON.stringify(twinSeed, null, 2), "utf-8");

  return {
    intake_path: intakePath,
    snapshot_path: snapshotPath,
    twin_seed_path: twinSeedPath,
  };
}
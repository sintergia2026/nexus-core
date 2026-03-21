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

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeSegment(value: string): string {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizeTimestamp(timestamp: string): string {
  return String(timestamp || new Date().toISOString())
    .trim()
    .replace(/[:.]/g, "-")
    .replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function directoryExists(targetPath: string): boolean {
  try {
    return fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

function looksLikeRepoRoot(candidate: string): boolean {
  return (
    directoryExists(path.join(candidate, "02_contracts")) &&
    directoryExists(path.join(candidate, "05_engine")) &&
    directoryExists(path.join(candidate, "06_data"))
  );
}

function resolveRepoRoot(): string {
  let current = process.cwd();

  for (let i = 0; i < 8; i += 1) {
    if (looksLikeRepoRoot(current)) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      break;
    }

    current = parent;
  }

  throw new Error(
    `Unable to resolve nexus-core repository root from cwd: ${process.cwd()}`
  );
}

function buildArtifactBaseName(intake: CrcpIntakePayload): string {
  const organizationId = sanitizeSegment(
    intake.context?.organization_id || "unknown-org"
  );
  const sector = sanitizeSegment(intake.context?.sector || "unknown-sector");
  const subsector = sanitizeSegment(
    intake.context?.subsector || "unknown-subsector"
  );
  const capturedAt = sanitizeTimestamp(
    intake.captured_at || new Date().toISOString()
  );
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${organizationId}__${sector}__${subsector}__${capturedAt}__${suffix}`;
}

function toRepoRelativePath(repoRoot: string, absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

function writeJsonFile(targetPath: string, payload: unknown): void {
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), "utf-8");
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

  writeJsonFile(intakePath, intake);
  writeJsonFile(snapshotPath, snapshot);
  writeJsonFile(twinSeedPath, twinSeed);

  return {
    intake_path: toRepoRelativePath(repoRoot, intakePath),
    snapshot_path: toRepoRelativePath(repoRoot, snapshotPath),
    twin_seed_path: toRepoRelativePath(repoRoot, twinSeedPath),
  };
}
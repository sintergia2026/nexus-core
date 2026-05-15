export interface RuntimeContext {
  organizationId: string;
  siteId: string;
  weekId: string;
}

export type ContextResolutionResult =
  | { status: "resolved"; context: RuntimeContext }
  | { status: "unresolved" };

// For test scripts and dev tooling only. Not used by resolveRuntimeContext.
export const DEV_FALLBACK_CONTEXT: RuntimeContext = {
  organizationId: "org-sintergia-demo",
  siteId: "site-004",
  weekId: "site-004::2026-W11",
};

export function resolveRuntimeContext(searchParams?: {
  organizationId?: string;
  siteId?: string;
  weekId?: string;
}): ContextResolutionResult {
  const org  = searchParams?.organizationId?.trim();
  const site = searchParams?.siteId?.trim();
  const week = searchParams?.weekId?.trim();

  if (!org || !site || !week) {
    return { status: "unresolved" };
  }

  return {
    status: "resolved",
    context: { organizationId: org, siteId: site, weekId: week },
  };
}

// Reserved for future auto-select priority.
// Assumes contexts are sorted descending by storedAt (as getAvailableContexts returns).
export function deriveDefaultContext(
  contexts: RuntimeContext[]
): RuntimeContext | null {
  return contexts.length > 0 ? contexts[0] : null;
}
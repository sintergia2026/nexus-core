export interface RuntimeContext {
  organizationId: string;
  siteId: string;
  weekId: string;
}

export const DEFAULT_RUNTIME_CONTEXT: RuntimeContext = {
  organizationId: "org-sintergia-demo",
  siteId: "site-004",
  weekId: "site-004::2026-W11",
};

export function resolveRuntimeContext(searchParams?: {
  organizationId?: string;
  siteId?: string;
  weekId?: string;
}): RuntimeContext {
  return {
    organizationId:
      searchParams?.organizationId?.trim() || DEFAULT_RUNTIME_CONTEXT.organizationId,
    siteId: searchParams?.siteId?.trim() || DEFAULT_RUNTIME_CONTEXT.siteId,
    weekId: searchParams?.weekId?.trim() || DEFAULT_RUNTIME_CONTEXT.weekId,
  };
}
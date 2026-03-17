export type ISODateString = string;

export interface OperationalWeek {
  weekId: string;
  weekStart: ISODateString; // YYYY-MM-DD
  weekEnd: ISODateString;   // YYYY-MM-DD
  timezone: string;         // e.g. America/Denver
  calendarYear: number;
  weekNumber: number;
}

export interface OperationalUnitKey {
  organizationId: string;
  siteId: string;
  sectorType: string;
  operationalWeek: OperationalWeek;
}

export function buildOperationalWeekId(
  siteId: string,
  calendarYear: number,
  weekNumber: number
): string {
  return `${siteId}::${calendarYear}-W${String(weekNumber).padStart(2, "0")}`;
}
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Skeleton } from "@genone/ui";

interface CohortMonth {
  month: string;          // "December 2025"
  created: number;
  breaches: Array<{ horizonDays: number; count: number | null }>;
}

const HORIZONS = [30, 60, 90, 120, 150, 180, 365];

export function RetentionCohort({ rows, isLoading }: { rows: CohortMonth[]; isLoading?: boolean }) {
  if (isLoading) return <Skeleton className="h-72 w-full" />;

  // For colour intensity scaling
  const maxPct = Math.max(
    1,
    ...rows.flatMap((r) =>
      r.breaches
        .filter((b) => b.count !== null)
        .map((b) => ((b.count ?? 0) / Math.max(1, r.created)) * 100)
    )
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account retention cohort</CardTitle>
        <CardDescription>
          For each month of new accounts, the share that has breached within the listed horizon.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider pb-3 pr-4 w-[180px]"></th>
              {HORIZONS.map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider pb-3 pr-2">
                  Breach in {h === 365 ? "1yr" : `${h}d`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}>
                <td className="pr-4 py-1">
                  <div className="text-sm font-semibold text-[var(--text)]">{r.month}</div>
                  <div className="text-xs text-[var(--text-muted)]">Accounts Created: {r.created}</div>
                </td>
                {HORIZONS.map((h) => {
                  const b = r.breaches.find((x) => x.horizonDays === h);
                  if (!b || b.count === null) {
                    return (
                      <td key={h} className="pr-2 py-1">
                        <div className="h-14 rounded-md border border-dashed border-[var(--border)] bg-transparent flex items-center justify-center text-[var(--text-faint)]">
                          -
                        </div>
                      </td>
                    );
                  }
                  const pct = (b.count / Math.max(1, r.created)) * 100;
                  const intensity = Math.min(1, pct / maxPct);
                  return (
                    <td key={h} className="pr-2 py-1">
                      <div
                        className="h-14 rounded-md flex flex-col items-start justify-center px-3"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--accent) ${Math.round(intensity * 65)}%, var(--surface-2))`,
                          color: intensity > 0.45 ? "white" : "var(--text)",
                        }}
                      >
                        <span className="text-base font-semibold tabular-nums">{b.count}</span>
                        <span className="text-xs opacity-80 tabular-nums">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// Demo data ready-to-use snapshot.
export function buildRetentionCohortMock(): CohortMonth[] {
  return [
    { month: "December 2025", created: 9,  breaches: [{ horizonDays: 30, count: 1 }, { horizonDays: 60, count: 1 }, { horizonDays: 90, count: 2 }, { horizonDays: 120, count: 2 }, { horizonDays: 150, count: 2 }, { horizonDays: 180, count: null }, { horizonDays: 365, count: null }] },
    { month: "January 2026",  created: 50, breaches: [{ horizonDays: 30, count: 4 }, { horizonDays: 60, count: 6 }, { horizonDays: 90, count: 8 }, { horizonDays: 120, count: 8 }, { horizonDays: 150, count: null }, { horizonDays: 180, count: null }, { horizonDays: 365, count: null }] },
    { month: "February 2026", created: 30, breaches: [{ horizonDays: 30, count: 9 }, { horizonDays: 60, count: 10 }, { horizonDays: 90, count: 10 }, { horizonDays: 120, count: null }, { horizonDays: 150, count: null }, { horizonDays: 180, count: null }, { horizonDays: 365, count: null }] },
    { month: "March 2026",    created: 11, breaches: [{ horizonDays: 30, count: 0 }, { horizonDays: 60, count: 1 }, { horizonDays: 90, count: null }, { horizonDays: 120, count: null }, { horizonDays: 150, count: null }, { horizonDays: 180, count: null }, { horizonDays: 365, count: null }] },
    { month: "April 2026",    created: 1,  breaches: [{ horizonDays: 30, count: 0 }, { horizonDays: 60, count: null }, { horizonDays: 90, count: null }, { horizonDays: 120, count: null }, { horizonDays: 150, count: null }, { horizonDays: 180, count: null }, { horizonDays: 365, count: null }] },
  ];
}

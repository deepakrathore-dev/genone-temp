"use client";
import { useForecast } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle, Skeleton, formatCurrency } from "@genone/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from "recharts";

export default function ForecastPage() {
  const { data, isLoading } = useForecast();
  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Withdrawal forecast</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Gross liability before profit split. Daily computation at 03:00 UTC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.map((b) => (
          <Card key={b.horizonDays}>
            <CardHeader><CardTitle className="text-sm">{b.horizonDays}-day forecast</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold">{formatCurrency(b.forecastCents)}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)] font-mono">
                90% interval {formatCurrency(b.low)} - {formatCurrency(b.high)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Forecast curve (cents/day)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateCurve()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--border)" tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="high" stroke="var(--accent)" fill="var(--accent-soft)" name="High" />
              <Area type="monotone" dataKey="forecast" stroke="var(--primary)" fill="var(--primary-soft)" name="Forecast" />
              <Area type="monotone" dataKey="low" stroke="var(--info)" fill="var(--info-soft)" name="Low" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function generateCurve() {
  return Array.from({ length: 30 }, (_, i) => {
    const day = `D+${i + 1}`;
    const base = 1500 + i * 180;
    return { day, low: base - 300, forecast: base, high: base + 350 };
  });
}

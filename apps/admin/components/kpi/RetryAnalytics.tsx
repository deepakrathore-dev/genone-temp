"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@genone/ui";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const DATA = [
  { attempts: "1", count: 1820 },
  { attempts: "2", count: 1015 },
  { attempts: "3", count: 540 },
  { attempts: "4", count: 245 },
  { attempts: "5", count: 142 },
  { attempts: "6", count: 86 },
  { attempts: "7+", count: 124 },
];

export function RetryAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Retry Analytics</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">Traders per attempt count.</p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="attempts" tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--border)" />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--border)" />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
            <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

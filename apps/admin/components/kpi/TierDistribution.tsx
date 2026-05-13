"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@genone/ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const DATA = [
  { name: "50K", value: 48, fill: "#5b6dff" },
  { name: "100K", value: 36, fill: "#8a5cf6" },
  { name: "150K", value: 16, fill: "#22c55e" },
];

export function TierDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tier Distribution</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">Purchases over the last 30 days.</p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={DATA} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {DATA.map((d) => <Cell key={d.name} fill={d.fill} />)}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

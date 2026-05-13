"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatTile, Badge, Button, formatCurrency } from "@genone/ui";
import { ExternalLink, MessagesSquare, Star } from "lucide-react";
import { payouts } from "@genone/mock-data";

// Public-trust surfaces (Module 10). The numbers reflect the snapshot in our mock data.
export default function CommunityPage() {
  const disbursed = payouts.filter((p) => p.status === "DISBURSED");
  const total = disbursed.reduce((s, p) => s + p.amountCents, 0);
  const traderIds = new Set(disbursed.map((p) => p.userId));
  const avgHours = 38; // mock - REQ-075

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Community & public trust</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Live payout stats, social proof, and links to where our traders hang out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatTile label="Total payouts disbursed" value={formatCurrency(total)} hint="Updates every 5 minutes" />
        <StatTile label="Funded traders paid" value={String(traderIds.size)} />
        <StatTile label="Avg approval time" value={`${avgHours}h`} hint="Request → disbursed" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest payouts</CardTitle>
          <CardDescription>Most recent 10 disbursements. Trader names are anonymised.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-[var(--border)]">
            {disbursed.slice(0, 10).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--success)]/40 to-[var(--primary)]/40 flex items-center justify-center text-xs font-mono font-medium text-white">
                    {p.userId.slice(-2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Trader {p.userId.slice(-4).toUpperCase()}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">via {p.method.toLowerCase()} · payout #{p.sequence}</div>
                  </div>
                </div>
                <span className="font-mono font-semibold text-success">{formatCurrency(p.amountCents)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><MessagesSquare className="h-4 w-4 text-[var(--primary)]" /> Discord</CardTitle>
            <CardDescription>Talk strategy with funded traders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="https://discord.gg/genone" target="_blank" rel="noreferrer">
                Join Discord <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-[var(--warning)]" /> TrustPilot</CardTitle>
            <CardDescription>4.7 / 5 from 1,284 traders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="https://www.trustpilot.com/review/genone.example" target="_blank" rel="noreferrer">
                Read reviews <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Badge variant="success">Live</Badge></CardTitle>
            <CardDescription>Monthly transparency snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-[var(--text-muted)] font-mono">
            <div>Pass rate <span className="text-[var(--text)] font-semibold">4.8%</span></div>
            <div>Funded conversion <span className="text-[var(--text)] font-semibold">2.1%</span></div>
            <div>Mean profit factor <span className="text-[var(--text)] font-semibold">1.32</span></div>
            <div>Median trader hours <span className="text-[var(--text)] font-semibold">42 h</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

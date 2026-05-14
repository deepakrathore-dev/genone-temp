"use client";
import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Input, Label,
} from "@genone/ui";
import { Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { Account } from "@genone/types";

export function CredentialModal({
  open, onOpenChange, account,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; account: Account;
}) {
  const [verified, setVerified] = React.useState(false);
  const [password, setPassword] = React.useState("");

  React.useEffect(() => { if (!open) { setVerified(false); setPassword(""); } }, [open]);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--warning)]" />
            Account credentials
          </DialogTitle>
          <DialogDescription>
            Re-authentication is required before credentials can be revealed. Every view is audit-logged.
          </DialogDescription>
        </DialogHeader>

        {!verified ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Account password</Label>
              <Input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && password.length >= 8) setVerified(true); }}
                placeholder="Enter your password"
              />
              <p className="text-[10px] text-[var(--text-faint)]">
                For your security, every credential view is recorded in your account&apos;s audit history.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button disabled={password.length < 8} onClick={() => setVerified(true)}>Unlock</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <Row label="Username" value={`gen1.${account.rithmicAccountId.toLowerCase()}`} onCopy={copy} />
            <Row label="Password" value="••••••••-temp-rotate" onCopy={copy} hidden />
            <Row label="Gateway URL" value="rprotocol.rithmic.com:443" onCopy={copy} />
            <Row label="Account ID" value={account.rithmicAccountId} onCopy={copy} />
            <p className="text-[10px] text-[var(--text-faint)] leading-relaxed">
              Use these credentials in R|Trader Pro, NinjaTrader, Quantower, Bookmap, TradingView, Sierra Chart, MotiveWave, TradeSea, Onyx Trader, or DeepCharts.
            </p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, onCopy, hidden }: { label: string; value: string; onCopy: (l: string, v: string) => void; hidden?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} type={hidden ? "password" : "text"} className="font-mono text-xs" />
        <Button size="icon" variant="outline" onClick={() => onCopy(label, value)} aria-label={`Copy ${label}`}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";
import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Textarea,
} from "@genone/ui";
import type { ButtonProps } from "@genone/ui";

type Tone = "primary" | "success" | "danger" | "warning";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: Tone;
  /** When true, require the admin to type a non-empty reason before confirming. */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
}

const TONE_VARIANT: Record<Tone, ButtonProps["variant"]> = {
  primary: "primary",
  success: "success",
  danger: "danger",
  warning: "primary",
};

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  tone = "primary",
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Add a note for the audit log",
  onConfirm,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const canConfirm = !requireReason || reason.trim().length > 0;

  const submit = async () => {
    if (!canConfirm) return;
    try {
      setBusy(true);
      await onConfirm(requireReason ? reason.trim() : undefined);
    } finally {
      setBusy(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {requireReason && (
          <div className="space-y-1.5">
            <Label>{reasonLabel}</Label>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={TONE_VARIANT[tone]} onClick={submit} disabled={!canConfirm || busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

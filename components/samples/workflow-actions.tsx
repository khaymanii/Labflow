"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FlaskConical,
  Inbox,
  Loader2,
  Play,
  Send,
} from "lucide-react";
import type { SampleStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ActionTransition = {
  from: SampleStatus;
  to: SampleStatus;
  action: string;
  shortAction: string;
  description: string;
  notePlaceholder: string;
};

const ACTION_ICONS: Record<SampleStatus, typeof Play> = {
  REGISTERED: Play,
  PROCESSING: FlaskConical,
  RESULT_PRODUCED: Send,
  AWAITING_DISPATCH: Inbox,
  RECEIVED_AT_DISPATCH: CheckCircle2,
  COLLECTED: CheckCircle2,
};

export function WorkflowActions({
  sampleId,
  transitions,
  compact = false,
}: {
  sampleId: string;
  transitions: ActionTransition[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState<ActionTransition | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function openDialog(transition: ActionTransition) {
    setActive(transition);
    setNote("");
    setError(null);
  }

  async function handleConfirm() {
    if (!active) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/samples/${sampleId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: active.to,
          note: note.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Could not update the sample status.");
        return;
      }

      setSuccess("Status updated successfully.");
      setActive(null);
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {success && !compact ? (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {transitions.map((transition, index) => {
          const Icon = ACTION_ICONS[transition.to] ?? Play;
          return (
            <Button
              key={transition.to}
              onClick={() => openDialog(transition)}
              variant={index === 0 ? "default" : "outline"}
            >
              <Icon className="h-4 w-4" />
              {transition.shortAction}
            </Button>
          );
        })}
      </div>

      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open && !loading) setActive(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.action}</DialogTitle>
            <DialogDescription>{active?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="transition-note">
              Note <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="transition-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={active?.notePlaceholder}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Your name and the current time will be recorded in the audit trail.
            </p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

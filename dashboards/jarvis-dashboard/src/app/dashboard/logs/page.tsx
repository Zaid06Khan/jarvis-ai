"use client";
import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, fetcher, CardSkeleton } from "@/components/jarvis/ui-bits";
import { Moon, Clock, Zap } from "lucide-react";

export default function LogsPage() {
  const { data, isLoading } = useSWR("/api/logs", fetcher, { refreshInterval: 60000 });
  const items: any[] = data?.items || [];
  const [open, setOpen] = useState<any>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Overnight Log" subtitle="Every autonomous run, while you slept" />

      {isLoading ? <Card className="glass p-5"><CardSkeleton rows={5} /></Card> :
        items.length === 0 ? (
          <Card className="glass p-12 text-center text-sm text-muted-foreground">
            No overnight runs yet. The engine runs nightly at 2 AM, or trigger it from the Command Center.
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((b) => {
              const date = new Date(b.created_at);
              const niche = (b.raw_content || "").match(/Focus niche:\*\*\s*(.+)/)?.[1]?.trim()
                || (b.raw_content || "").match(/niche:\s*(.+)/i)?.[1]?.trim() || "—";
              return (
                <Card key={b.id} className="glass p-4 hover:glow transition-all cursor-pointer" onClick={() => setOpen(b)}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground truncate">Focus: {niche}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] gap-1 hidden sm:flex"><Clock className="h-3 w-3" />{date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}</Badge>
                    <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary"><Zap className="h-3 w-3" />~$0.05</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Overnight Brief — {open && new Date(open.created_at).toLocaleDateString("en-CA", { month: "long", day: "numeric" })}</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm bg-card/50 rounded-lg border p-4">{open?.raw_content}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";
import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, fetcher, CardSkeleton } from "@/components/jarvis/ui-bits";
import { money, dateShort } from "@/lib/format";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["contacted", "interested", "demo", "converted"];
const STAGE_COLOR: Record<string, string> = {
  contacted: "border-muted-foreground/40 text-muted-foreground",
  interested: "border-sky-400/40 text-sky-400",
  demo: "border-amber-400/40 text-amber-400",
  converted: "border-primary/40 text-primary",
};

export default function LeadsPage() {
  const { data, isLoading, mutate } = useSWR("/api/leads", fetcher, { refreshInterval: 30000 });
  const items: any[] = data?.items || [];
  const [followup, setFollowup] = useState<{ open: boolean; text: string; loading: boolean }>({ open: false, text: "", loading: false });

  async function updateStatus(id: string, status: string) {
    await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    toast.success(`Moved to ${status}`); mutate();
  }

  async function genFollowup(lead: any) {
    setFollowup({ open: true, text: "", loading: true });
    const res = await fetch("/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: lead.name, type: lead.business_type || lead.source, status: lead.status, notes: lead.notes }),
    });
    const d = await res.json();
    setFollowup({ open: true, text: d.message || d.error || "Failed", loading: false });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lead Tracker" subtitle="Aria receptionist CRM — Toronto outreach pipeline" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGES.map((s) => (
          <Card key={s} className="p-4 glass">
            <p className="text-xs text-muted-foreground capitalize">{s}</p>
            <p className="text-2xl font-bold mt-1">{items.filter((i) => i.status === s).length}</p>
          </Card>
        ))}
      </div>

      <Card className="glass overflow-hidden">
        {isLoading ? <div className="p-5"><CardSkeleton rows={6} /></div> : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No leads yet. Aria outreach leads will appear here.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="hidden lg:table-cell">Last contact</TableHead>
                <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name || l.email || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{l.business_type || l.source || "—"}</TableCell>
                  <TableCell>
                    <Select value={l.status || "contacted"} onValueChange={(v) => updateStatus(l.id, v)}>
                      <SelectTrigger className={cn("h-7 w-32 text-xs", STAGE_COLOR[l.status])}><SelectValue /></SelectTrigger>
                      <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{dateShort(l.last_contact || l.created_at)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{money(l.est_revenue)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-primary" onClick={() => genFollowup(l)}>
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Follow-up
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={followup.open} onOpenChange={(o) => setFollowup((f) => ({ ...f, open: o }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>AI-generated follow-up</DialogTitle></DialogHeader>
          {followup.loading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="whitespace-pre-wrap text-sm bg-card/50 rounded-lg border p-4 max-h-[50vh] overflow-y-auto">{followup.text}</div>
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(followup.text); toast.success("Copied"); }}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

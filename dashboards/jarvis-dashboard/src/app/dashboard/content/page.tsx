"use client";
import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, fetcher, CardSkeleton } from "@/components/jarvis/ui-bits";
import { timeAgo } from "@/lib/format";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-amber-400/40 text-amber-400",
  approved: "border-primary/40 text-primary",
  posted: "border-sky-400/40 text-sky-400",
  rejected: "border-destructive/40 text-destructive",
};

export default function ContentPage() {
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [preview, setPreview] = useState<any>(null);
  const { data, isLoading, mutate } = useSWR(
    `/api/content?platform=${platform}&status=${status}`, fetcher, { refreshInterval: 20000 });
  const items: any[] = data?.items || [];

  async function setItemStatus(id: string, newStatus: string) {
    await fetch("/api/content", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    toast.success(`Marked ${newStatus}`);
    mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Content Queue" subtitle="Review and approve everything Jarvis generates" />

      <div className="flex flex-wrap gap-3">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            {["all", "image", "linkedin", "tiktok", "instagram", "email", "product-idea"].map((p) => (
              <SelectItem key={p} value={p}>{p === "all" ? "All platforms" : p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "posted", "rejected"].map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="glass">
        {isLoading ? (
          <div className="p-5"><CardSkeleton rows={6} /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No content matches these filters.</div>
        ) : (
          <div className="divide-y">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors">
                {it.platform === "image" && (
                  <img src={it.raw_content} alt="" className="h-12 w-12 rounded-md object-cover border shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{it.topic}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{it.platform === "image" ? "🖼️ Generated image" : it.raw_content}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{it.platform}</Badge>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", STATUS_COLORS[it.status] || "")}>{it.status}</Badge>
                <span className="text-xs text-muted-foreground hidden md:block w-16 text-right">{timeAgo(it.created_at)}</span>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPreview(it)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => setItemStatus(it.id, "approved")}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setItemStatus(it.id, "rejected")}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{preview?.topic}</DialogTitle></DialogHeader>
          <div className="flex gap-2">
            <Badge variant="outline">{preview?.platform}</Badge>
            <Badge variant="outline" className={STATUS_COLORS[preview?.status] || ""}>{preview?.status}</Badge>
          </div>
          {preview?.platform === "image" ? (
            <img src={preview.raw_content} alt={preview.topic} className="rounded-lg border w-full max-h-[60vh] object-contain bg-card/50" />
          ) : (
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm bg-card/50 rounded-lg border p-4">
              {preview?.raw_content}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setItemStatus(preview.id, "rejected"); setPreview(null); }}>Reject</Button>
            <Button onClick={() => { setItemStatus(preview.id, "approved"); setPreview(null); }}>Approve</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

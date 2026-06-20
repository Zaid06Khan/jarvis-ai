"use client";
import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader, StatCard, fetcher } from "@/components/jarvis/ui-bits";
import { money } from "@/lib/format";
import { toast } from "sonner";
import { BookOpen, BookPlus, Loader2, DollarSign, TrendingUp, ExternalLink } from "lucide-react";

const COVERS = [
  "from-emerald-500/30 to-teal-700/30", "from-sky-500/30 to-indigo-700/30",
  "from-amber-500/30 to-orange-700/30", "from-violet-500/30 to-fuchsia-700/30",
];

export default function EbooksPage() {
  const { data, isLoading } = useSWR("/api/ebooks", fetcher, { refreshInterval: 30000 });
  const items: any[] = data?.items || [];
  const [niche, setNiche] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const totalRevenue = items.reduce((a, e) => a + Number(e.revenue || 0), 0);
  const totalSales = items.reduce((a, e) => a + Number(e.sales_count || 0), 0);

  async function generate() {
    setBusy(true);
    const res = await fetch("/api/ebooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche }) });
    const d = await res.json();
    res.ok ? toast.success(d.message) : toast.error(d.message || "Failed");
    setBusy(false); setOpen(false); setNiche("");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ebook Manager" subtitle="Your published digital products" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><BookPlus className="h-4 w-4 mr-2" /> New Ebook</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate a new ebook</DialogTitle></DialogHeader>
            <Input placeholder="Niche (e.g. detox water recipes)" value={niche} onChange={(e) => setNiche(e.target.value)} />
            <DialogFooter>
              <Button onClick={generate} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start generation"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Published" value={items.length} icon={BookOpen} loading={isLoading} />
        <StatCard label="Total Sales" value={totalSales} icon={TrendingUp} loading={isLoading} accent="blue" />
        <StatCard label="Ebook Revenue" value={money(totalRevenue)} icon={DollarSign} loading={isLoading} accent="violet" />
      </div>

      {items.length === 0 && !isLoading ? (
        <Card className="glass p-12 text-center text-sm text-muted-foreground">
          No ebooks yet. Click <span className="text-primary">New Ebook</span> to have Jarvis generate one.
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((e, i) => (
            <Card key={e.id} className="glass overflow-hidden group">
              <div className={`aspect-[3/4] bg-gradient-to-br ${COVERS[i % COVERS.length]} flex items-end p-4 relative`}>
                <BookOpen className="absolute top-3 right-3 h-5 w-5 text-foreground/40" />
                <p className="font-bold leading-tight text-sm drop-shadow">{e.name}</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{money(e.price)}</span>
                  <Badge variant="outline" className={e.active ? "border-primary/40 text-primary text-[10px]" : "text-[10px]"}>
                    {e.active ? "live" : "draft"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{e.sales_count || 0} sales</span>
                  <span>{money(e.revenue)}</span>
                </div>
                {e.url && <a href={e.url} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline"><ExternalLink className="h-3 w-3" /> View</a>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

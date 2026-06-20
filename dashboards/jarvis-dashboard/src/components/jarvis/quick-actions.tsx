"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Moon, BookPlus, Send, Loader2 } from "lucide-react";

async function trigger(action: string, niche?: string) {
  const res = await fetch("/api/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, niche }),
  });
  const j = await res.json().catch(() => ({}));
  if (res.ok) toast.success(j.message || "Done");
  else toast.error(j.message || "Action failed");
  return j;
}

export function QuickActions() {
  const [busy, setBusy] = useState<string | null>(null);
  const [niche, setNiche] = useState("");
  const [open, setOpen] = useState(false);

  async function run(action: string, niche?: string) {
    setBusy(action);
    await trigger(action, niche);
    setBusy(null);
    setOpen(false);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button variant="secondary" className="h-auto py-4 flex-col gap-2 border hover:border-primary/40"
        disabled={busy === "run-overnight"} onClick={() => run("run-overnight")}>
        {busy === "run-overnight" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Moon className="h-5 w-5 text-primary" />}
        <span className="text-sm font-medium">Run Overnight</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="h-auto py-4 flex-col gap-2 border hover:border-primary/40">
            <BookPlus className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Generate Ebook</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate a new ebook</DialogTitle></DialogHeader>
          <Input placeholder="Niche (e.g. detox water recipes)" value={niche} onChange={(e) => setNiche(e.target.value)} />
          <DialogFooter>
            <Button disabled={busy === "generate-ebook"} onClick={() => run("generate-ebook", niche)}>
              {busy === "generate-ebook" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start generation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="secondary" className="h-auto py-4 flex-col gap-2 border hover:border-primary/40"
        disabled={busy === "morning-brief"} onClick={() => run("morning-brief")}>
        {busy === "morning-brief" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 text-primary" />}
        <span className="text-sm font-medium">Send Morning Brief</span>
      </Button>
    </div>
  );
}

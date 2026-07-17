"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Moon, BookPlus, Send, ImageIcon, Loader2 } from "lucide-react";

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

  // image generation
  const [imgOpen, setImgOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [imgBusy, setImgBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run(action: string, niche?: string) {
    setBusy(action);
    await trigger(action, niche);
    setBusy(null);
    setOpen(false);
  }

  async function genImage() {
    if (!prompt.trim()) return;
    setImgBusy(true); setResult(null);
    const res = await fetch("/api/image", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, size }),
    });
    const j = await res.json();
    setImgBusy(false);
    if (res.ok) { setResult(j.url); toast.success("Image generated"); }
    else toast.error(j.error || "Generation failed");
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Generate Image (DALL-E / gpt-image) */}
      <Dialog open={imgOpen} onOpenChange={setImgOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="h-auto py-4 flex-col gap-2 border hover:border-primary/40">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Generate Image</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate an image</DialogTitle></DialogHeader>
          <Textarea rows={3} placeholder="Describe the image (e.g. ebook cover for a gut-health guide, warm and clean)"
            value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">Square 1024×1024 (posts)</SelectItem>
              <SelectItem value="1792x1024">Landscape (ebook covers)</SelectItem>
              <SelectItem value="1024x1792">Vertical (TikTok / stories)</SelectItem>
            </SelectContent>
          </Select>
          {result && (
            <img src={result} alt="generated" className="rounded-lg border w-full" />
          )}
          <DialogFooter>
            <Button onClick={genImage} disabled={imgBusy || !prompt.trim()}>
              {imgBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : result ? "Generate another" : "Generate"}
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

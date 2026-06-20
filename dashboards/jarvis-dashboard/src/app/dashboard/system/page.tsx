"use client";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader, fetcher } from "@/components/jarvis/ui-bits";
import { Cpu, MemoryStick, HardDrive, Server, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

function Dot({ up }: { up: boolean | null }) {
  return <span className={cn("h-2.5 w-2.5 rounded-full", up === true ? "bg-primary pulse-dot" : up === false ? "bg-destructive" : "bg-muted-foreground")} />;
}

function Gauge({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  const color = value > 85 ? "text-destructive" : value > 65 ? "text-amber-400" : "text-primary";
  return (
    <Card className="p-5 glass">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-2xl font-bold mb-2">{Math.round(value)}%</p>
      <Progress value={value} className="h-2" />
    </Card>
  );
}

export default function SystemPage() {
  const { data } = useSWR("/api/system", fetcher, { refreshInterval: 10000 });
  const vps = data?.vps;
  const services: any[] = data?.services || [];
  const providers = data?.providers || {};

  return (
    <div className="space-y-6">
      <PageHeader title="System Health" subtitle="Live status of your AI OS infrastructure" action={
        <Badge variant="outline" className={cn("gap-1.5", data?.routerUp ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive")}>
          <Dot up={!!data?.routerUp} /> {data?.routerUp ? "Online" : "Unreachable"}
        </Badge>
      } />

      {/* VPS gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vps ? (
          <>
            <Gauge label="CPU" value={vps.cpu ?? 0} icon={Cpu} />
            <Gauge label="Memory" value={vps.mem ?? 0} icon={MemoryStick} />
            <Gauge label="Disk" value={vps.disk ?? 0} icon={HardDrive} />
          </>
        ) : (
          <Card className="glass p-6 sm:col-span-3 text-center text-sm text-muted-foreground">
            VPS metrics load from the router&apos;s <code>/system/stats</code> endpoint.
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Services */}
        <Card className="glass p-5">
          <div className="flex items-center gap-2 mb-4"><Server className="h-4 w-4 text-primary" /><h2 className="font-semibold">Services</h2></div>
          <div className="space-y-2">
            {(services.length ? services : [{ name: "FastAPI Router" }, { name: "Hermes Gateway" }, { name: "n8n" }, { name: "Redis" }, { name: "Supabase" }]).map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border bg-card/40 px-4 py-3">
                <div className="flex items-center gap-3"><Dot up={s.up ?? null} /><span className="text-sm font-medium">{s.name}</span></div>
                <Badge variant="outline" className={cn("text-[10px]", s.up === true ? "border-primary/40 text-primary" : s.up === false ? "border-destructive/40 text-destructive" : "")}>
                  {s.up === true ? "operational" : s.up === false ? "down" : "unknown"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* AI providers */}
        <Card className="glass p-5">
          <div className="flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /><h2 className="font-semibold">AI Providers</h2></div>
          <div className="space-y-2">
            {[
              { k: "anthropic", label: "Anthropic (Claude)" },
              { k: "openai", label: "OpenAI (Codex / GPT-5.5)" },
              { k: "gemini", label: "Google (Gemini)" },
            ].map((p) => (
              <div key={p.k} className="flex items-center justify-between rounded-lg border bg-card/40 px-4 py-3">
                <div className="flex items-center gap-3"><Dot up={!!providers[p.k]} /><span className="text-sm font-medium">{p.label}</span></div>
                <Badge variant="outline" className={cn("text-[10px]", providers[p.k] ? "border-primary/40 text-primary" : "")}>
                  {providers[p.k] ? "connected" : "not configured"}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Live credit balances aren&apos;t exposed by provider APIs — check each console for billing.</p>
        </Card>
      </div>

      {vps?.uptime && <p className="text-xs text-muted-foreground text-center">VPS uptime: {vps.uptime} · load {vps.load}</p>}
    </div>
  );
}

"use client";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader, StatCard, fetcher } from "@/components/jarvis/ui-bits";
import { QuickActions } from "@/components/jarvis/quick-actions";
import { money, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DollarSign, CalendarDays, TrendingUp, FileText, Users, BookOpen, Sparkles, Activity,
} from "lucide-react";

export default function CommandCenter() {
  const { data, isLoading } = useSWR("/api/overview", fetcher, { refreshInterval: 15000 });
  const agents = data?.agents || [];
  const onlineCount = agents.filter((a: any) => a.status === "online").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        subtitle="Your AI operating system at a glance"
        action={
          <Badge variant="outline" className={cn("gap-1.5", data?.routerUp ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive")}>
            <span className={cn("h-2 w-2 rounded-full", data?.routerUp ? "bg-primary pulse-dot" : "bg-destructive")} />
            {data?.routerUp ? "All systems operational" : "Router offline"}
          </Badge>
        }
      />

      {/* Revenue + counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue Today" value={money(data?.revenue?.today)} icon={DollarSign} loading={isLoading} />
        <StatCard label="This Week" value={money(data?.revenue?.week)} icon={CalendarDays} loading={isLoading} accent="blue" />
        <StatCard label="This Month" value={money(data?.revenue?.month)} icon={TrendingUp} loading={isLoading} accent="violet" />
        <StatCard label="Agents Online" value={`${onlineCount}/${agents.length || 21}`} icon={Sparkles} loading={isLoading} accent="amber" />
      </div>

      {/* Quick actions */}
      <Card className="p-5 glass">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <QuickActions />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent fleet status */}
        <Card className="p-5 glass lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Agent Fleet</h2>
            <span className="text-xs text-muted-foreground">{agents.length} specialists</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(agents.length ? agents : Array.from({ length: 21 })).map((a: any, i: number) => (
              <div key={a?.name || i} className="flex items-center gap-2 rounded-lg border bg-card/50 px-3 py-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0",
                  a?.status === "online" ? "bg-primary" : a ? "bg-destructive" : "bg-muted")} />
                <span className="text-xs font-medium truncate">{a?.name?.replace("hermes-", "") || "—"}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity feed */}
        <Card className="p-5 glass">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-3">
              {(data?.activity || []).map((a: any) => (
                <div key={a.id} className="flex gap-3">
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{a.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-1 text-[10px] py-0">{a.platform}</Badge>
                      {timeAgo(a.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              {!isLoading && (data?.activity || []).length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No activity yet</p>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Last automated actions */}
      <Card className="p-5 glass">
        <h2 className="font-semibold mb-4">Last 5 Automated Actions</h2>
        <div className="space-y-2">
          {(data?.lastActions || []).slice(0, 5).map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card/40 px-3 py-2.5">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm truncate flex-1">{a.topic}</span>
              <Badge variant="outline" className="text-[10px]">{a.platform}</Badge>
              <span className="text-xs text-muted-foreground hidden sm:block">{timeAgo(a.created_at)}</span>
            </div>
          ))}
          {!isLoading && (data?.lastActions || []).length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">Run the overnight engine to see actions here</p>
          )}
        </div>
      </Card>
    </div>
  );
}

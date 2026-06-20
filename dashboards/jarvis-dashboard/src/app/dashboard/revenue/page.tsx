"use client";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard, fetcher } from "@/components/jarvis/ui-bits";
import { RevenueArea } from "@/components/jarvis/charts";
import { money } from "@/lib/format";
import { DollarSign, ShoppingBag, Store, Phone, Target } from "lucide-react";

export default function RevenuePage() {
  const { data, isLoading } = useSWR("/api/revenue", fetcher, { refreshInterval: 30000 });
  const goal = data?.goal || 5000;
  const month = data?.totals?.month || 0;
  const pct = Math.min(100, Math.round((month / goal) * 100));

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" subtitle="All income streams, combined" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This Month" value={money(month)} icon={DollarSign} loading={isLoading} />
        <StatCard label="Gumroad" value={money(data?.bySource?.gumroad)} icon={ShoppingBag} loading={isLoading} accent="blue" />
        <StatCard label="Etsy" value={money(data?.bySource?.etsy)} icon={Store} loading={isLoading} accent="amber" />
        <StatCard label="Aria MRR" value={money(data?.aria?.mrr)} sub={`${data?.aria?.clients || 0} active clients`} icon={Phone} loading={isLoading} accent="violet" />
      </div>

      {/* Monthly goal */}
      <Card className="p-5 glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Monthly Goal</h2>
          </div>
          <span className="text-sm text-muted-foreground">{money(month)} / {money(goal)}</span>
        </div>
        <Progress value={pct} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">{pct}% of monthly target</p>
      </Card>

      {/* Combined revenue over time */}
      <Card className="p-5 glass">
        <h2 className="font-semibold mb-4">Revenue — last 30 days</h2>
        {(data?.series || []).length > 0 ? (
          <RevenueArea
            data={data.series}
            keys={[
              { name: "gumroad", color: "hsl(199 89% 48%)" },
              { name: "etsy", color: "hsl(47 95% 55%)" },
              { name: "aria", color: "hsl(142 71% 45%)" },
            ]}
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            No revenue data yet — sales will appear here as they come in.
          </div>
        )}
      </Card>
    </div>
  );
}

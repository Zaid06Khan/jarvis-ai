import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, sub, icon: Icon, loading, accent = "primary",
}: {
  label: string; value: React.ReactNode; sub?: string; icon?: LucideIcon; loading?: boolean;
  accent?: "primary" | "blue" | "amber" | "violet";
}) {
  const accents: Record<string, string> = {
    primary: "text-primary bg-primary/10 border-primary/20",
    blue: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    violet: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  };
  return (
    <Card className="p-5 glass relative overflow-hidden transition-all hover:glow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center", accents[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 mt-3" />
      ) : (
        <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

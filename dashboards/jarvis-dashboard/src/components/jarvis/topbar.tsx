"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, LogOut, Bot } from "lucide-react";
import { timeAgo } from "@/lib/format";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export function Topbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data } = useSWR("/api/notifications", fetcher, { refreshInterval: 20000 });
  const notes: any[] = data?.items || [];

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 h-16 border-b glass flex items-center gap-3 px-4 lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 glass">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 lg:hidden">
        <Bot className="h-5 w-5 text-primary" />
        <span className="font-bold">JARVIS</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notes.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {notes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notes.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">All clear ✨</div>
            )}
            {notes.slice(0, 8).map((n, i) => (
              <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-2">
                <div className="flex items-center gap-2 w-full">
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {n.kind}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(n.at)}</span>
                </div>
                <span className="text-sm">{n.text}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={logout} title="Log out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

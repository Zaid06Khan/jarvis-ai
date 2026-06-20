import {
  LayoutDashboard, DollarSign, FileText, MessageSquare,
  Users, BookOpen, Moon, Activity,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
  { href: "/dashboard/content", label: "Content Queue", icon: FileText },
  { href: "/dashboard/agents", label: "Agent Chat", icon: MessageSquare },
  { href: "/dashboard/leads", label: "Lead Tracker", icon: Users },
  { href: "/dashboard/ebooks", label: "Ebook Manager", icon: BookOpen },
  { href: "/dashboard/logs", label: "Overnight Log", icon: Moon },
  { href: "/dashboard/system", label: "System Health", icon: Activity },
] as const;

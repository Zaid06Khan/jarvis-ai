import { Sidebar } from "@/components/jarvis/sidebar";
import { Topbar } from "@/components/jarvis/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen jarvis-grid-bg">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}

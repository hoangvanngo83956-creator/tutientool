import { MobileTopbar } from "@/components/mobile-topbar";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-ink">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <div className="min-w-0 border-l border-line bg-white">
          <MobileTopbar />
          {children}
        </div>
      </div>
    </div>
  );
}

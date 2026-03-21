import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(isMobile && !sidebarOpen && "hidden", isMobile && "z-30")}>
        <AppSidebar />
      </div>

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", !isMobile && "ml-60")}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-10 p-2 bg-card rounded-lg shadow-md border border-border md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

import { LayoutDashboard, FolderKanban, BarChart3, MessageSquare, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["team_lead", "admin", "super_admin"] },
  { label: "Projects", path: "/projects", icon: FolderKanban, roles: ["team_lead", "admin", "super_admin"] },
  { label: "Analytics", path: "/analytics", icon: BarChart3, roles: ["admin", "super_admin"] },
  { label: "AI Chatbot", path: "/chatbot", icon: MessageSquare, roles: ["super_admin"] },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0">
          PT
        </div>
        {!collapsed && <span className="font-semibold text-sidebar-accent-foreground text-base tracking-tight">ProTrack AI</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

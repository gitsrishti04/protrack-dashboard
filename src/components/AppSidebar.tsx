import {
  LayoutDashboard, FolderKanban, BarChart3, MessageSquare,
  LogOut, ChevronLeft, ChevronRight, Users, Crown, Shield, User as UserIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",  path: "/dashboard", icon: LayoutDashboard, roles: ["team_lead", "admin", "super_admin"] },
  { label: "Projects",   path: "/projects",  icon: FolderKanban,    roles: ["team_lead", "admin", "super_admin"] },
  { label: "Analytics",  path: "/analytics", icon: BarChart3,        roles: ["admin", "super_admin"] },
  { label: "Users",      path: "/users",     icon: Users,            roles: ["admin", "super_admin"] },
  { label: "AI Chatbot", path: "/chatbot",   icon: MessageSquare,    roles: ["super_admin"] },
];

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  super_admin: {
    label: "Super Admin",
    color: "bg-violet-100 text-violet-700",
    icon: <Crown className="w-3 h-3" />,
  },
  admin: {
    label: "Admin",
    color: "bg-blue-100 text-blue-700",
    icon: <Shield className="w-3 h-3" />,
  },
  team_lead: {
    label: "Team Lead",
    color: "bg-emerald-100 text-emerald-700",
    icon: <UserIcon className="w-3 h-3" />,
  },
};

export default function AppSidebar() {
  const { user, logout, roleLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const roleCfg = user ? (roleConfig[user.role] ?? roleConfig["team_lead"]) : null;
  const avatarLetter = user ? (user.name || user.email)[0].toUpperCase() : "?";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
        {!collapsed && (
          <span className="font-semibold text-sidebar-accent-foreground text-base tracking-tight">
            ProTrack AI
          </span>
        )}
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

      {/* User profile section */}
      {!collapsed && (
        <div className="border-t border-sidebar-border px-3 py-3">
          {roleLoading ? (
            /* Skeleton while backend role is loading */
            <div className="flex items-center gap-3 px-1 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent/60 shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3 w-24 rounded bg-sidebar-accent/60" />
                <div className="h-2.5 w-32 rounded bg-sidebar-accent/40" />
                <div className="h-4 w-16 rounded-full bg-sidebar-accent/40" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 px-1">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {avatarLetter}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">
                  {user.name || user.email.split("@")[0]}
                </p>
                <p className="text-[11px] text-sidebar-foreground/60 truncate">{user.email}</p>
                {roleCfg && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      roleCfg.color
                    )}
                  >
                    {roleCfg.icon}
                    {roleCfg.label}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Collapsed avatar (no text) */}
      {collapsed && user && (
        <div className="border-t border-sidebar-border px-2 py-3 flex justify-center">
          {roleLoading ? (
            <div className="w-8 h-8 rounded-full bg-sidebar-accent/60 animate-pulse" />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold"
              title={`${user.name || user.email} (${roleCfg?.label ?? user.role})`}
            >
              {avatarLetter}
            </div>
          )}
        </div>
      )}

      {/* Bottom controls */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-5 h-5 shrink-0" />
            : <ChevronLeft className="w-5 h-5 shrink-0" />}
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

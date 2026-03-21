import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";

const roleLabelMap: Record<string, string> = {
  team_lead: "Team Lead",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <h2 className="text-lg font-semibold text-foreground">
        {user ? `${roleLabelMap[user.role]} Dashboard` : "ProTrack AI"}
      </h2>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors active:scale-95">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabelMap[user.role]}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

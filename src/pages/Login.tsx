import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Lock, Mail, ChevronDown } from "lucide-react";

const roles: { value: UserRole; label: string }[] = [
  { value: "team_lead", label: "Team Lead" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("team_lead");
  const [roleOpen, setRoleOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
            PT
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">ProTrack AI</span>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h1 className="text-lg font-semibold text-center mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  <span>{roles.find((r) => r.value === role)?.label}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {roleOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r.value); setRoleOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Demo mode — any email/password works
        </p>
      </div>
    </div>
  );
}

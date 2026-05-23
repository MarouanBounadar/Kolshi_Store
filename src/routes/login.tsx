import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Mail, Lock, Loader2, LogIn } from "lucide-react";

// الـ Route هنا هو /login العادي ولكن مخصص للـ Admin
export const Route = createFileRoute("/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // تسجيل دخول صارم للأدمن فقط
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setErrorMsg("Identifiants incorrects. Accès refusé.");
      setLoading(false);
      return;
    }

    if (data.session) {
      navigate({ to: "/admin" }); // كيدوز ديريكت لـ لوحة التحكم د الأدمن
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-[#0a0a0c] text-white">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-glow-sm">
        
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 grid place-items-center mb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <h1 className="font-display text-2xl font-bold">Connexion Admin</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Kolchi-Smart Control Panel
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center border bg-red-500/10 border-red-500/20 text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email Admin</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kolchi-smart.ma"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#111115] border border-border text-sm focus:outline-none focus:border-red-500 transition text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#111115] border border-border text-sm focus:outline-none focus:border-red-500 transition text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Se connecter
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
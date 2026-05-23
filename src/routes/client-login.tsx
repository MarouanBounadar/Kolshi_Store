import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Mail, Lock, Loader2, LogIn } from "lucide-react";

export const Route = createFileRoute("/client-login")({
  component: ClientLoginPage,
});

function ClientLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim();

    // 1. تسجيل دخول الزبون
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (!signInError && signInData.session) {
      navigate({ to: "/dashboard" }); // ديه لـ Espace Client نيشان
      setLoading(false);
      return;
    }

    // 2. إيلا مكاينش الحساب، السيستم كيكرييه ليه أوتوماتيكياً
    if (signInError?.message?.includes("Invalid login credentials") || signInError?.status === 400) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
      });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        setLoading(false);
        return;
      }

      if (signUpData.session) {
        navigate({ to: "/dashboard" });
      } else {
        setErrorMsg("Compte créé ! Veuillez vérifier votre boîte email.");
      }
    } else {
      setErrorMsg(signInError?.message || "Une erreur est survenue.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-[#0a0a0c] text-white">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-glow-sm">
        
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-electric/10 border border-electric/20 grid place-items-center mb-3">
            <ShoppingBag className="h-5 w-5 text-electric" />
          </div>
          <h1 className="font-display text-2xl font-bold">Connexion Client</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Accédez à votre espace client Kolchi-Smart
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center border bg-red-500/10 border-red-500/20 text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleClientLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Votre Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: example@gmail.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#111115] border border-border text-sm focus:outline-none focus:border-electric transition text-white"
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
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#111115] border border-border text-sm focus:outline-none focus:border-electric transition text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-electric text-black font-bold text-sm flex items-center justify-center gap-2 transition hover:scale-[1.01] cursor-pointer mt-2 shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Se connecter / S'inscrire
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
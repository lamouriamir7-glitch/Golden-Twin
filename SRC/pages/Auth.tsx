import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
  };

  const continueAsGuest = () => {
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <main className="starfield min-h-screen flex items-center justify-center">
        <p className="text-yellow-400/60 text-sm animate-pulse">جاري التحميل...</p>
      </main>
    );
  }

  if (isAuthenticated) return null;

  return (
    <main className="starfield min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-sm text-center">
        <p className="text-yellow-400/50 text-xs tracking-[0.3em] mb-6">الترقية</p>
        <div className="text-5xl mb-6">🔮</div>
        <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-300 via-purple-100 to-yellow-400 bg-clip-text text-transparent">
          DIGITAL TWIN
        </h1>
        <p className="text-purple-200/50 text-sm mb-10">صدى روحك في الكون</p>

        <div className="space-y-3">
          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-6 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            الدخول عبر جوجل
          </button>

          <button
            onClick={continueAsGuest}
            className="w-full py-3.5 px-6 rounded-xl border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition font-medium text-sm"
          >
            الدخول كضيف
          </button>
        </div>

        <div className="mt-12 text-yellow-400/30 text-xs flex items-center justify-center gap-2">
          <span>◀</span>
          <span>ثمة حكمة ثم</span>
          <span>▶</span>
        </div>
        <p className="text-purple-400/20 text-xs mt-2 italic px-4">
          «أنت لست قطرة في محيط، أنت المحيط بأكمله في قطرة.»
        </p>
        <p className="text-purple-400/15 text-xs mt-1">— جلال الدين الرومي —</p>
      </div>
    </main>
  );
}

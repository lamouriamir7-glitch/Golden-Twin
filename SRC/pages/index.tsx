import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";

type Profile = {
  id: string;
  nickname: string;
  vector: number[] | null;
};

const buildFallback = (id: string): Profile => ({
  id,
  nickname: "Guest",
  vector: Array(30).fill(0),
});

const isValidVector = (v: number[] | null | undefined): boolean => {
  if (!v || !Array.isArray(v) || v.length === 0) return false;
  return v.some((x) => x !== 0);
};

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, isAuthenticated, isLoading: authLoading } = useCurrentUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        if (!isAuthenticated || !id) {
          setProfile(buildFallback("guest_" + Math.random().toString(36).substr(2, 8)));
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

        if (error || !data) {
          setProfile(buildFallback(id));
          setLoading(false);
          return;
        }

        setProfile(data as Profile);

        if (!isValidVector(data.vector)) {
          navigate("/fingerprint", { replace: true });
          return;
        }

        setLoading(false);
      } catch {
        setProfile(buildFallback(id || "fallback"));
        setLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated, id, navigate]);

  if (loading || authLoading || !profile) {
    return (
      <main className="starfield min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-pulse">🔮</span>
          <p className="text-yellow-400/60 mt-4 text-sm animate-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </main>
    );
  }

  const justAnalyzed = location.state?.justAnalyzed;
  const isGuest = profile.id.startsWith("guest_");

  return (
    <main className="starfield min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-sm text-center">
        {isGuest ? (
          <>
            <p className="text-yellow-400/50 text-xs tracking-[0.3em] mb-6">الترقية</p>
            <div className="text-5xl mb-6">🔮</div>
            <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-300 via-purple-100 to-yellow-400 bg-clip-text text-transparent">
              DIGITAL TWIN
            </h1>
            <p className="text-purple-200/50 text-sm mb-10">صدى روحك في الكون</p>
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-400 transition font-medium text-sm"
            >
              تسجيل الدخول
            </button>
          </>
        ) : justAnalyzed ? (
          <>
            <p className="text-yellow-400/50 text-xs tracking-[0.3em] mb-6">تم بنجاح</p>
            <div className="text-5xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">لقد تم تحليل بصمتك</h2>
            <p className="text-purple-200/50 text-sm mb-1">أهلاً بك يا {profile.nickname}</p>
            <p className="text-purple-300/30 text-xs mb-8">بصمتك النفسية محفوظة في الفضاء</p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium hover:from-purple-500 hover:to-purple-400 transition text-sm mb-3"
            >
              🔍 اكتشف توأمك
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 px-6 rounded-xl border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition text-sm"
            >
              تصفح رسائلك
            </button>
          </>
        ) : (
          <div className="text-purple-200 text-sm">مرحباً {profile.nickname} - جاري تجهيز الرسائل...</div>
        )}

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

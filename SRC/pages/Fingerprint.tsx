import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";
import { AI_PROMPT, processUserVector } from "@/lib/wind-engine";
import { toast } from "sonner";

export default function Fingerprint() {
  const navigate = useNavigate();
  const { id: userId, isAuthenticated, isLoading: authLoading } = useCurrentUser();

  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [needsNickname, setNeedsNickname] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !userId) {
      navigate("/auth", { replace: true });
      return;
    }

    supabase
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (!data?.nickname || data.nickname === "Unknown") {
          setNeedsNickname(true);
        }
      })
      .catch(() => setNeedsNickname(true));
  }, [authLoading, isAuthenticated, userId, navigate]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      toast.success("✅ تم نسخ النص");
    } catch {
      toast.error("❌ فشل النسخ");
    }
  };

  const submit = async () => {
    const trimmedNick = nickname.trim();
    if (needsNickname && !trimmedNick) {
      toast.error("⚠️ اختر اسماً مستعاراً");
      return;
    }
    if (!code.trim()) {
      toast.error("⚠️ ألصق كود Base64");
      return;
    }
    const vector = processUserVector(code.trim());
    if (!vector || vector.length !== 30) {
      toast.error("❌ كود غير صالح");
      return;
    }
    if (!vector.some((v) => v !== 0)) {
      toast.error("❌ البصمة فارغة");
      return;
    }

    setLoading(true);
    try {
      const finalNickname = trimmedNick || "User_" + userId.substring(0, 6);
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        nickname: finalNickname,
        vector,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("✅ تم تسجيل بصمتك النفسية!");
      navigate("/", { replace: true, state: { justAnalyzed: true } });
    } catch (e: any) {
      toast.error("❌ فشل في حفظ البصمة");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="starfield min-h-screen flex items-center justify-center">
        <p className="text-yellow-400/60 text-sm animate-pulse">جاري التحميل...</p>
      </main>
    );
  }

  return (
    <main className="starfield min-h-screen px-4 py-8 relative overflow-hidden">
      <div className="relative z-10 max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-yellow-400/50 hover:text-yellow-400 text-sm mb-8 flex items-center gap-1 transition"
        >
          ⬅ رجوع
        </button>

        <div className="text-center mb-8">
          <p className="text-yellow-400/50 text-xs tracking-[0.3em] mb-4">تحليل البصمة</p>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">البصمة النفسية</h1>
          <p className="text-purple-200/50 text-sm">حول شخصيتك إلى مصفوفة رقمية من 30 بعداً</p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 backdrop-blur-sm p-6 mb-4">
          <h2 className="text-yellow-400 font-bold text-sm mb-4">📋 كيفية الحصول على الكود</h2>
          <ol className="space-y-3 text-purple-200/60 text-sm">
            <li className="flex gap-2"><span className="text-yellow-400 font-bold">1.</span> انسخ النص التحليلي</li>
            <li className="flex gap-2"><span className="text-yellow-400 font-bold">2.</span> أرسله لـ ChatGPT أو Claude</li>
            <li className="flex gap-2"><span className="text-yellow-400 font-bold">3.</span> اكتب أفكارك بحرية</li>
            <li className="flex gap-2"><span className="text-yellow-400 font-bold">4.</span> انسخ كود Base64 الناتج</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 backdrop-blur-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-yellow-400 font-bold text-sm">نص المحلل النفسي</h2>
            <button
              onClick={copyPrompt}
              className="px-4 py-2 rounded-lg border border-yellow-500/40 text-yellow-400 text-xs hover:bg-yellow-500/10 transition"
            >
              📋 نسخ
            </button>
          </div>
          <div className="bg-[#0a0014] rounded-lg p-3 max-h-24 overflow-y-auto">
            <p className="text-purple-300/30 text-xs whitespace-pre-wrap">
              {AI_PROMPT.substring(0, 200)}...
            </p>
          </div>
        </div>

        {needsNickname && (
          <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 backdrop-blur-sm p-6 mb-4">
            <h2 className="text-yellow-400 font-bold text-sm mb-3">اختر اسماً مستعاراً</h2>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="مثلاً: المتأمل الحزين"
              maxLength={30}
              className="w-full bg-[#0a0014] border border-purple-500/30 rounded-lg px-4 py-3 text-purple-200 placeholder-purple-500/30 focus:border-yellow-500/50 focus:outline-none text-sm"
            />
          </div>
        )}

        <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-yellow-400 font-bold text-sm mb-3">ألصق كود Base64</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ألصق الكود هنا..."
            rows={4}
            className="w-full bg-[#0a0014] border border-purple-500/30 rounded-lg px-4 py-3 text-purple-200 placeholder-purple-500/30 focus:border-yellow-500/50 focus:outline-none text-sm resize-none"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium hover:from-purple-500 hover:to-purple-400 transition disabled:opacity-50 text-sm"
        >
          {loading ? "⏳ جاري تحليل البصمة..." : "تسجيل البصمة النفسية"}
        </button>
      </div>
    </main>
  );
}

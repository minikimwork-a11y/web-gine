"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === "Invalid login credentials" 
          ? "이메일 혹은 비밀번호가 일치하지 않습니다." 
          : authError.message);
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("로그인 중 예기치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex items-center justify-center relative p-4 font-sans selection:bg-[#ff3c00] selection:text-white">
      {/* Background visual elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff3c00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative lines / frames */}
      <div className="absolute top-8 left-8 text-xs font-mono tracking-widest text-[#ff3c00]/40 pointer-events-none">
        1004_BOGUMZARI // SECURE_AUTH
      </div>
      <div className="absolute bottom-8 right-8 text-xs font-mono tracking-widest text-white/20 pointer-events-none">
        SYS_VER_1.0
      </div>

      <div className="w-full max-w-md bg-black/40 border border-white/10 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-[#ff3c00]/30">
        {/* Subtle orange accent bar at the top */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff3c00] to-transparent" />
        
        <div className="mb-8 text-center">
          <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-2">
            ADMINISTRATOR
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white font-[var(--font-syncopate)] uppercase">
            LOG IN
          </h2>
          <p className="text-xs text-white/40 mt-2">
            1004 보금자리 웹진 관리자 시스템
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[#ff3c00]/10 border border-[#ff3c00]/20 text-[#ff5522] text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-white/60 block">
              Email Address (이메일)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#ff3c00]/60 focus:bg-white/[0.08]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-white/60 block">
              Password (비밀번호)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#ff3c00]/60 focus:bg-white/[0.08]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e0e0e0] text-[#0a0a0a] hover:bg-[#ff3c00] hover:text-white disabled:bg-white/10 disabled:text-white/20 font-bold py-3.5 px-4 rounded-lg text-sm tracking-wider transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2 group"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 75%, 93% 100%, 0 100%)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono text-xs">
                인증 중...
              </span>
            ) : (
              <span className="uppercase tracking-widest font-mono">Access Console</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

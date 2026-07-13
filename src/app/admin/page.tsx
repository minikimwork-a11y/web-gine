"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">
        Checking authentication session...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] p-8 md:p-12 relative font-sans selection:bg-[#ff3c00] selection:text-white">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff3c00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-12 gap-4">
        <div>
          <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-1">
            CONTROL CONSOLE
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white font-[var(--font-syncopate)] uppercase">
            ADMIN PANEL
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-xs text-white/60">
            <div>LOGGED IN AS</div>
            <div className="text-white font-semibold">{user.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-white/5 hover:bg-[#ff3c00]/20 hover:text-[#ff3c00] border border-white/10 hover:border-[#ff3c00]/30 transition-all duration-300 font-mono text-xs px-4 py-2.5 rounded-lg cursor-pointer"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Welcome Dashboard Box */}
          <div className="md:col-span-2 bg-black/40 border border-white/10 backdrop-blur-xl p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff3c00] to-transparent" />
            <h2 className="text-xl font-bold text-white mb-4">1004 보금자리 웹진 관리 시스템</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              관리자 모드에 오신 것을 환영합니다. 이 세션은 안전하게 보호되고 있으며, 웹진에 들어가는 포스트, 에피소드 관리 및 구독자 설정을 편집할 수 있습니다.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-xs font-mono text-white/40 block mb-1">SYSTEM STATE</span>
                <span className="text-sm font-semibold text-emerald-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  CONNECTED TO SUPABASE
                </span>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-xs font-mono text-white/40 block mb-1">ROLES</span>
                <span className="text-sm font-semibold text-white">SYSTEM OWNER</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-black/40 border border-white/10 backdrop-blur-xl p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-left p-3.5 rounded-xl transition-all duration-300 text-sm text-white/80 hover:text-white flex items-center justify-between group">
                  <span>새 웹진 포스트 작성</span>
                  <span className="font-mono text-xs text-[#ff3c00] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-left p-3.5 rounded-xl transition-all duration-300 text-sm text-white/80 hover:text-white flex items-center justify-between group">
                  <span>구독자 목록 보기</span>
                  <span className="font-mono text-xs text-[#ff3c00] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-xs font-mono text-white/30 border-t border-white/5 pt-4">
              Authorized session token active.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isWebzineActive = pathname.startsWith("/posts");
  const isSponsorshipActive = pathname.startsWith("/sponsorship");

  return (
    <header className="border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="1004 보금자리 로고" className="h-8 object-contain filter brightness-110" />
          <span className="font-sans font-bold text-base tracking-wide text-white group-hover:text-[#ff3c00] transition-colors">
            1004 보금자리 웹진
          </span>
        </Link>

        {/* GNB Navigation Links */}
        <nav className="flex items-center gap-6 md:gap-8" aria-label="주 메뉴">
          <Link
            href="/posts"
            className={`text-sm font-medium transition-all duration-300 relative py-1.5 ${
              isWebzineActive
                ? "text-[#ff3c00] font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            웹진 소식
            {isWebzineActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff3c00] rounded-full" />
            )}
          </Link>
          <Link
            href="/sponsorship"
            className={`text-sm font-medium transition-all duration-300 relative py-1.5 ${
              isSponsorshipActive
                ? "text-[#ff3c00] font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            따뜻한 후원
            {isSponsorshipActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff3c00] rounded-full" />
            )}
          </Link>
        </nav>

        {/* Right Action */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-mono tracking-wider border border-white/10 hover:border-white/30 text-white/60 hover:text-white px-3.5 py-2 rounded-lg transition-all duration-300"
          >
            홈으로
          </Link>
          <Link
            href="/login"
            className="text-xs font-mono tracking-wider border border-white/20 hover:border-[#ff3c00] hover:text-[#ff3c00] text-white/80 px-3.5 py-2 rounded-lg transition-all duration-300 bg-black/20"
          >
            관리자 로그인
          </Link>
        </div>
      </div>
    </header>
  );
}

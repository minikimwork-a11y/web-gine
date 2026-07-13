"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isWebzineActive = pathname.startsWith("/posts");
  const isSponsorshipActive = pathname.startsWith("/sponsorship");
  const isLightPage = isWebzineActive || isSponsorshipActive;

  return (
    <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${
      isLightPage 
        ? "border-zinc-200/80 backdrop-blur-xl bg-white/85" 
        : "border-white/10 backdrop-blur-xl bg-black/40"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="1004 보금자리 로고" 
            className={`h-8 object-contain transition-all ${isLightPage ? "" : "filter brightness-110"}`} 
          />
          <span className={`font-sans font-bold text-base tracking-wide group-hover:text-[#ff3c00] transition-colors ${
            isLightPage ? "text-zinc-800" : "text-white"
          }`}>
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
                : isLightPage
                ? "text-zinc-500 hover:text-zinc-800"
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
                : isLightPage
                ? "text-zinc-500 hover:text-zinc-800"
                : "text-white/60 hover:text-white"
            }`}
          >
            따뜻한 후원
            {isSponsorshipActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff3c00] rounded-full" />
            )}
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className={`text-xs font-mono tracking-wider border px-3.5 py-2 rounded-lg transition-all duration-300 ${
              isLightPage
                ? "border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            홈으로
          </Link>
          <Link
            href="/login"
            className={`text-xs font-mono tracking-wider border px-3.5 py-2 rounded-lg transition-all duration-300 ${
              isLightPage
                ? "border-zinc-300 text-zinc-700 hover:border-[#ff3c00] hover:text-[#ff3c00] bg-white/80"
                : "border-white/20 text-white/80 hover:border-[#ff3c00] hover:text-[#ff3c00] bg-black/20"
            }`}
          >
            admin
          </Link>
        </div>
      </div>
    </header>
  );
}

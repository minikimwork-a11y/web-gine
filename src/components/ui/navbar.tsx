"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isWebzineActive = pathname.startsWith("/posts");
  const isSponsorshipActive = pathname.startsWith("/sponsorship");

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Branding */}
        <a href="http://1004house.co.kr" className="flex items-center gap-3 group" onClick={closeMobile}>
          <img src="/logo.png" alt="1004 보금자리 로고" className="h-9 object-contain filter brightness-125 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)] transition-transform group-hover:scale-105" />
          <span className="font-sans font-bold text-base tracking-wide text-white group-hover:text-[#ff3c00] transition-colors hidden sm:inline-block">
            보금자리 웹진
          </span>
        </a>

        {/* Desktop GNB */}
        <nav className="hidden sm:flex items-center gap-6 md:gap-8" aria-label="주 메뉴">
          <Link
            href="/posts"
            className={`text-sm font-medium transition-all duration-300 relative py-1.5 ${isWebzineActive
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
            className={`text-sm font-medium transition-all duration-300 relative py-1.5 ${isSponsorshipActive
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

        {/* Desktop Right Actions (Icon Buttons) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="http://1004house.co.kr"
            title="홈으로 이동"
            aria-label="홈으로 이동"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all duration-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </a>
          <Link
            href="/login"
            title="관리자 콘솔 (Admin)"
            aria-label="관리자 콘솔 (Admin)"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/15 hover:border-[#ff3c00]/60 bg-black/40 hover:bg-[#ff3c00]/10 text-white/70 hover:text-[#ff3c00] transition-all duration-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          <span className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-80 border-t border-white/10" : "max-h-0"
          }`}
      >
        <nav className="flex flex-col px-6 py-4 gap-1 bg-black/60 backdrop-blur-xl">
          <Link
            href="/posts"
            onClick={closeMobile}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${isWebzineActive
              ? "text-[#ff3c00] bg-[#ff3c00]/10 font-semibold"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            웹진 소식
          </Link>
          <Link
            href="/sponsorship"
            onClick={closeMobile}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${isSponsorshipActive
              ? "text-[#ff3c00] bg-[#ff3c00]/10 font-semibold"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            따뜻한 후원
          </Link>
          <div className="h-[1px] bg-white/10 my-2" />
          <a
            href="http://1004house.co.kr"
            onClick={closeMobile}
            className="py-3 px-4 rounded-xl text-sm text-white/60 hover:text-white transition-all hover:bg-white/5 flex items-center gap-2.5"
          >
            <svg
              className="w-4 h-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            홈으로
          </a>
          <Link
            href="/login"
            onClick={closeMobile}
            className="py-3 px-4 rounded-xl text-sm text-white/60 hover:text-[#ff3c00] transition-all hover:bg-white/5 flex items-center gap-2.5 font-mono"
          >
            <svg
              className="w-4 h-4 text-[#ff3c00]/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            ADMIN
          </Link>
        </nav>
      </div>
    </header>
  );
}

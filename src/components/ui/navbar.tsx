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
        <Link href="/" className="flex items-center gap-3 group" onClick={closeMobile}>
          <img src="/logo.png" alt="1004 보금자리 로고" className="h-9 object-contain filter brightness-125 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)] transition-transform group-hover:scale-105" />
          <span className="font-sans font-bold text-base tracking-wide text-white group-hover:text-[#ff3c00] transition-colors hidden sm:inline-block">
            보금자리 웹진
          </span>
        </Link>

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

        {/* Desktop Right Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-mono tracking-wider border border-white/10 hover:border-white/30 text-white/60 hover:text-white px-3.5 py-2 rounded-lg transition-all duration-300"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="text-xs font-mono tracking-wider border border-white/20 hover:border-[#ff3c00] hover:text-[#ff3c00] text-white/80 px-3.5 py-2 rounded-lg transition-all duration-300 bg-black/20"
          >
            Admin
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
          <Link
            href="/"
            onClick={closeMobile}
            className="py-3 px-4 rounded-xl text-sm text-white/50 hover:text-white transition-all hover:bg-white/5"
          >
            홈으로
          </Link>
          <Link
            href="/login"
            onClick={closeMobile}
            className="py-3 px-4 rounded-xl text-sm text-white/50 hover:text-white transition-all hover:bg-white/5 font-mono"
          >
            admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

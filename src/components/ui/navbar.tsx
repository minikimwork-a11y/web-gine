"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlSearch = searchParams ? (searchParams.get("search") || "") : "";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(urlSearch);

  const isWebzineActive = pathname.startsWith("/posts");
  const isSponsorshipActive = pathname.startsWith("/sponsorship");

  const closeMobile = () => {
    setMobileOpen(false);
    setSearchVal("");
  };

  // Sync state if URL query changes externally
  useEffect(() => {
    setSearchVal(urlSearch);
    if (urlSearch) {
      setSearchOpen(true);
    }
  }, [urlSearch]);

  // Debounced URL updates when typing to search in real-time
  useEffect(() => {
    const isCurrentlyOnPosts = pathname.startsWith("/posts");
    if (!isCurrentlyOnPosts) return; // Only apply inline replace updates on the webzine page

    const timer = setTimeout(() => {
      if (searchVal !== urlSearch) {
        if (searchVal.trim()) {
          router.replace(`/posts?search=${encodeURIComponent(searchVal.trim())}`, { scroll: false });
        } else {
          router.replace(`/posts`, { scroll: false });
        }
      }
    }, 150); // 150ms debounce
    return () => clearTimeout(timer);
  }, [searchVal, urlSearch, pathname, router]);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    const isCurrentlyOnPosts = pathname.startsWith("/posts");
    
    // If not on posts page, immediately redirect on first typed character
    if (!isCurrentlyOnPosts && val.trim()) {
      router.push(`/posts?search=${encodeURIComponent(val.trim())}`);
    }
  };

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
          {/* Sliding Search Input */}
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchVal.trim()) {
                  router.push(`/posts?search=${encodeURIComponent(searchVal.trim())}`);
                  setSearchOpen(false);
                }
              }}
              placeholder="검색어 입력..."
              className={`bg-white/[0.03] text-xs text-white placeholder-white/30 outline-none transition-all duration-300 rounded-xl focus:border-[#ff3c00]/60 ${
                searchOpen 
                  ? "w-36 md:w-44 px-3 py-2 opacity-100 border border-white/15 mr-1" 
                  : "w-0 px-0 py-2 opacity-0 border-none overflow-hidden"
              }`}
              autoFocus={searchOpen}
            />
            <button
              onClick={() => {
                if (searchOpen) {
                  if (searchVal.trim()) {
                    router.push(`/posts?search=${encodeURIComponent(searchVal.trim())}`);
                    setSearchOpen(false);
                  } else {
                    setSearchOpen(false);
                  }
                } else {
                  setSearchOpen(true);
                }
              }}
              title="검색"
              aria-label="검색창 열기/검색 실행"
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                searchOpen
                  ? "border-[#ff3c00] bg-[#ff3c00]/10 text-[#ff3c00]"
                  : "border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white"
              }`}
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
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
          {/* Mobile Search Input */}
          <div className="relative w-full mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">🔍</span>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchVal.trim()) {
                  closeMobile();
                  router.push(`/posts?search=${encodeURIComponent(searchVal.trim())}`);
                }
              }}
              placeholder="웹진 검색..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-all"
            />
          </div>
          <Link
            href="/posts"
            onClick={closeMobile}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${isWebzineActive
              ? "text-white bg-white/10 font-semibold"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            웹진 소식
          </Link>
          <Link
            href="/sponsorship"
            onClick={closeMobile}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${isSponsorshipActive
              ? "text-white bg-white/10 font-semibold"
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
            className="py-3 px-4 rounded-xl text-sm text-white/60 hover:text-white transition-all hover:bg-white/5 flex items-center gap-2.5 font-mono"
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

export function Navbar() {
  return (
    <Suspense fallback={
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/40 h-[69px] sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-base tracking-wide text-white/40">보금자리 웹진</span>
          </div>
        </div>
      </header>
    }>
      <NavbarContent />
    </Suspense>
  );
}

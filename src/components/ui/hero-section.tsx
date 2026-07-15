"use client";

import { useRouter } from "next/navigation";

interface HeroSectionProps {
  title?: string;
  highlightText?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  colors?: string[];
  distortion?: number;
  swirl?: number;
  speed?: number;
  offsetX?: number;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
  maxWidth?: string;
  veilOpacity?: string;
  fontFamily?: string;
  fontWeight?: number;
}

export function HeroSection({
  title = "",
  highlightText = "1004 보금자리",
  description = "소중한 만남과 따뜻한 나눔이 있는 보금자리 웹진입니다. 함께 나누는 일상 속 아름다운 이야기를 만나보세요.",
  buttonText = "웹진 읽기",
  onButtonClick,
  colors = ["#ff3c00", "#ff6b35", "#ffb38a", "#fff3ec", "#8ecae6", "#219ebc"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.35,
  offsetX = 0.08,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-black/10 dark:bg-black/35",
  fontFamily = "var(--font-noto-sans-kr), sans-serif",
  fontWeight = 700,
}: HeroSectionProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.push("/posts");
    }
  };

  return (
    <section className={`relative w-full min-h-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center py-20 ${className}`}>

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 w-full z-20 px-8 py-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="font-sans font-bold text-lg tracking-wider text-white">

          </span>
        </div>
        <div className="pointer-events-auto">
          <a
            href="/login"
            title="관리자 콘솔 (Admin)"
            aria-label="관리자 콘솔 (Admin)"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/20 hover:border-[#ff3c00] text-white/80 hover:text-[#ff3c00] transition-all duration-300 backdrop-blur-md bg-black/30"
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
          </a>
        </div>
      </header>

      {/* Background Floating Orbs (CSS Optimized) */}
      <div className="fixed inset-0 w-screen h-screen bg-[#0a0a0a]">
        <div className="css-orb-container">
          <div className="css-orb orb-1" />
          <div className="css-orb orb-2" />
          <div className="css-orb orb-3" />
          <div className="css-orb orb-4" />
        </div>
        <div className={`absolute inset-0 pointer-events-none backdrop-blur-[2px] ${veilOpacity}`} />
      </div>

      {/* Content */}
      <div className={`relative z-10 ${maxWidth} mx-auto px-6 w-full flex flex-col items-center`}>
        <div className="text-center max-w-3xl">
          <h1
            className={`font-bold text-white text-balance text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[60px] leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-[1.1] mb-6 drop-shadow-md ${titleClassName}`}
            style={{ fontFamily, fontWeight }}
          >
            {title} <br className="sm:hidden" />
            <span className="text-[#ff3c00] dark:text-[#ff5522]">{highlightText}</span>
          </h1>
          <p className={`text-base sm:text-lg text-white/95 text-pretty max-w-2xl mx-auto leading-relaxed mb-10 px-4 drop-shadow ${descriptionClassName}`}>
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full pointer-events-auto">
            <button
              onClick={() => router.push("/posts")}
              className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-xl border-2 bg-gradient-to-r from-[#ff3c00] to-[#ff5522] border-transparent text-sm sm:text-base font-bold text-white hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-300 shadow-xl cursor-pointer"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              웹진 바로가기 &rarr;
            </button>
            <button
              onClick={() => window.open("http://1004house.co.kr", "_self")}
              className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-xl border-2 bg-zinc-900/80 border-white/10 hover:border-[#ff3c00]/40 text-sm sm:text-base font-bold text-white/95 hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl cursor-pointer backdrop-blur-md"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              홈페이지 바로가기 &rarr;
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

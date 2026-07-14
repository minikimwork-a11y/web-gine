import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60 backdrop-blur-xl mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="1004 보금자리 로고" className="h-7 object-contain filter brightness-125 drop-shadow-[0_0_1px_rgba(255,255,255,0.4)]" />
              <span className="font-bold text-white text-sm">1004 보금자리</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              발달장애인들의 행복한 보금자리와<br />
              자립을 돕는 따뜻한 공간입니다.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-white/60 tracking-widest uppercase">바로가기</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/posts" className="text-xs text-white/40 hover:text-white transition-colors">
                웹진 소식
              </Link>
              <Link href="/sponsorship" className="text-xs text-white/40 hover:text-white transition-colors">
                따뜻한 후원
              </Link>
              <Link href="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
                개인정보처리방침
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-white/60 tracking-widest uppercase">연락처</h4>
            <div className="space-y-1.5 text-xs text-white/40">
              <p>신안군복지재단 1004 보금자리</p>
              <p>전화: 061-275-0767</p>
              <p>이메일: shinan0769@naver.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/25 font-mono">
            © {new Date().getFullYear()} 1004 보금자리. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="text-[10px] text-white/25 hover:text-white/50 font-mono transition-colors"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}

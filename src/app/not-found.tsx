import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans flex items-center justify-center relative p-6">
      {/* Background */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-md space-y-6">
        <p className="text-[120px] sm:text-[160px] font-extrabold text-white/[0.03] leading-none select-none">
          404
        </p>
        <div className="-mt-20 relative space-y-4">
          <span className="font-mono text-xs text-[#0ea5e9] tracking-widest font-bold block uppercase">
            Page Not Found
          </span>
          <h1 className="text-2xl font-bold text-white">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            요청하신 페이지가 삭제되었거나, 주소가 변경되었을 수 있습니다.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[#0ea5e9] text-white text-sm font-bold hover:brightness-110 transition-all"
            >
              홈으로 이동
            </Link>
            <Link
              href="/posts"
              className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-sm font-medium transition-all"
            >
              웹진 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 1004 보금자리 웹진",
  description: "1004 보금자리 웹진의 개인정보 수집·이용·보호에 관한 방침입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#ff3c00] selection:text-white relative flex flex-col">
      {/* Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ff3c00]/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24 relative z-10 flex-1">
        {/* Header */}
        <div className="mb-12 space-y-3">
          <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block uppercase">
            Privacy Policy
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            개인정보처리방침
          </h1>
          <p className="text-xs text-white/40">
            시행일: 2026년 1월 1일 | 최종 수정: 2026년 6월 14일
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm text-white/70 leading-relaxed">

          {/* 제1조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제1조 (개인정보의 처리 목적)</h2>
            <p>
              신안군복지재단 1004 보금자리(이하 &ldquo;법인&rdquo;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li><strong className="text-white/80">후원 신청 접수:</strong> 후원 유형 확인, 후원금 관리, 기부금영수증 발행, 연락 및 안내</li>
              <li><strong className="text-white/80">자원봉사 신청:</strong> 봉사 일정 조율, 자원봉사확인서 발급</li>
              <li><strong className="text-white/80">문의 응대:</strong> 시설 이용 문의, 요청사항 처리</li>
            </ul>
          </section>

          {/* 제2조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제2조 (수집하는 개인정보 항목)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-white/10 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-white/5 text-white/80">
                    <th className="text-left px-4 py-3 font-semibold border-b border-white/10">구분</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-white/10">수집 항목</th>
                  </tr>
                </thead>
                <tbody className="text-white/60">
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 align-top font-medium text-white/70">필수</td>
                    <td className="px-4 py-3">성명, 연락처(전화번호)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 align-top font-medium text-white/70">선택</td>
                    <td className="px-4 py-3">이메일, 팩스번호, 주소(우편번호·상세주소)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 align-top font-medium text-white/70">정기 후원(CMS)</td>
                    <td className="px-4 py-3">은행명, 계좌번호, 예금주, 예금주 생년월일, 출금 희망일, 서명(이미지)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium text-white/70">기부금영수증</td>
                    <td className="px-4 py-3">주민등록번호(앞 6자리) 또는 사업자등록번호</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제3조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제3조 (개인정보의 처리 및 보유기간)</h2>
            <p>
              법인은 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li>후원 관련 정보: <strong className="text-white/80">후원 종료 후 5년</strong> (국세기본법에 따른 기부금영수증 보관 의무)</li>
              <li>자원봉사 정보: <strong className="text-white/80">봉사 활동 종료 후 3년</strong></li>
              <li>문의 기록: <strong className="text-white/80">처리 완료 후 1년</strong></li>
            </ul>
          </section>

          {/* 제4조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제4조 (개인정보의 제3자 제공)</h2>
            <p>
              법인은 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며,
              정보주체의 동의, 법률의 특별한 규정 등에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li>CMS 자동이체 금융기관 (정기 후원 처리를 위한 최소한의 정보)</li>
              <li>국세청 (기부금영수증 발행에 따른 법적 의무)</li>
            </ul>
          </section>

          {/* 제5조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제5조 (개인정보의 파기)</h2>
            <p>
              법인은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li><strong className="text-white/80">전자적 파일:</strong> 복원이 불가능한 방법으로 영구 삭제</li>
              <li><strong className="text-white/80">종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          {/* 제6조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p>정보주체는 법인에 대해 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p>
              위 권리 행사는 전화, 이메일, 또는 방문을 통해 하실 수 있으며,
              법인은 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          {/* 제7조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제7조 (개인정보의 안전성 확보 조치)</h2>
            <p>법인은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li>개인정보 접근 제한: 담당자에 한해 최소한의 인원으로 제한</li>
              <li>데이터 전송 보안: SSL/TLS 암호화 통신 적용</li>
              <li>데이터 저장 보안: 클라우드 데이터베이스 암호화 저장</li>
              <li>접근 기록 관리: 관리 시스템 접근 로그 기록</li>
            </ul>
          </section>

          {/* 제8조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제8조 (개인정보 보호책임자)</h2>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-2 text-xs">
              <p><span className="text-white/40 w-20 inline-block">직위:</span> <span className="text-white/80">사무국장</span></p>
              <p><span className="text-white/40 w-20 inline-block">소속:</span> <span className="text-white/80">신안군복지재단 1004 보금자리</span></p>
              <p><span className="text-white/40 w-20 inline-block">연락:</span> <span className="text-white/80">061-275-0767</span></p>
            </div>
          </section>

          {/* 제9조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제9조 (개인정보 처리방침의 변경)</h2>
            <p>
              이 개인정보처리방침은 시행일로부터 적용되며,
              법령 및 방침에 따른 변경 내용의 추가·삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 본 웹사이트를 통하여 공지할 것입니다.
            </p>
          </section>

          {/* 제10조 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">제10조 (권익침해 구제방법)</h2>
            <p>개인정보 침해에 대한 신고·상담이 필요한 경우 아래 기관으로 문의하실 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/60">
              <li>개인정보침해신고센터 (한국인터넷진흥원): <strong className="text-white/80">privacy.kisa.or.kr / 국번 없이 118</strong></li>
              <li>개인정보 분쟁조정위원회: <strong className="text-white/80">www.kopico.go.kr / 1833-6972</strong></li>
              <li>대검찰청 사이버수사과: <strong className="text-white/80">www.spo.go.kr / 국번 없이 1301</strong></li>
              <li>경찰청 사이버수사국: <strong className="text-white/80">ecrm.cyber.go.kr / 국번 없이 182</strong></li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";

type SponsType = "regular" | "temporary" | "goods" | "volunteer";
type PayMethod = "CMS" | "direct";
type AddressType = "home" | "office";
type ReceiptOpt = "personal" | "business" | "none";

export default function SponsorshipPage() {
  // Navigation / Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | "success">(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states - Step 1
  const [type, setType] = useState<SponsType>("regular");
  const [amount, setAmount] = useState<string>("30000"); // options: 10000, 20000, 30000, 50000, 100000, custom
  const [customAmount, setCustomAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<PayMethod>("CMS");
  const [goodsDesc, setGoodsDesc] = useState<string>("");
  const [goodsPhoto, setGoodsPhoto] = useState<File | null>(null);
  const [goodsPhotoPreview, setGoodsPhotoPreview] = useState<string | null>(null);
  const [goodsValuation, setGoodsValuation] = useState<string>("");
  const [amountDesc, setAmountDesc] = useState<string>("");

  // Form states - Step 2
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [fax, setFax] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [addressType, setAddressType] = useState<AddressType>("home");
  const [zipcode, setZipcode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [addressDetail, setAddressDetail] = useState<string>("");

  // Form states - Step 3
  const [bankName, setBankName] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [bankHolder, setBankHolder] = useState<string>("");
  const [bankBirth, setBankBirth] = useState<string>("");
  const [payDate, setPayDate] = useState<string>("5일");
  const [receiptOpt, setReceiptOpt] = useState<ReceiptOpt>("personal");
  const [juminNo, setJuminNo] = useState<string>("");

  // Signature canvas states
  const [showDonorPlaceholder, setShowDonorPlaceholder] = useState(true);
  const [showHolderPlaceholder, setShowHolderPlaceholder] = useState(true);
  const donorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Captcha states
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaInput("");
  };

  // Dynamic Daum Postcode script loader
  const handleAddressSearch = () => {
    const scriptId = "daum-postcode-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = () => execDaumPostcode();
      document.body.appendChild(script);
    } else {
      execDaumPostcode();
    }
  };

  const execDaumPostcode = () => {
    new (window as any).daum.Postcode({
      oncomplete: function (data: any) {
        setZipcode(data.zonecode);
        setAddress(data.address);
      },
    }).open();
  };

  // Canvas drawing handlers (mouse + touch support)
  const getCoords = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any, canvasRef: React.RefObject<HTMLCanvasElement | null>, setPlaceholder: (show: boolean) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    setPlaceholder(false);
    const coords = getCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
  };

  const draw = (e: any, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = (canvasRef: React.RefObject<HTMLCanvasElement | null>, setPlaceholder: (show: boolean) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPlaceholder(true);
  };

  const copyDonorSignature = () => {
    const donorCanvas = donorCanvasRef.current;
    const holderCanvas = holderCanvasRef.current;
    if (!donorCanvas || !holderCanvas) return;
    const ctx = holderCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, holderCanvas.width, holderCanvas.height);
    ctx.drawImage(donorCanvas, 0, 0);
    setShowHolderPlaceholder(false);
  };

  // Image file attachment preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGoodsPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGoodsPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Wizard navigation logic with validation
  const nextStep = () => {
    if (step === 1) {
      if (type === "goods" && !goodsDesc.trim()) {
        alert("후원하실 물품 정보(품목 및 수량)를 작성해 주세요.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) {
        alert("기부자명/단체명을 입력해 주세요.");
        return;
      }
      if (!phone.trim()) {
        alert("연락처를 입력해 주세요.");
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      alert("스팸 방지 질문의 정답이 올바르지 않습니다.");
      generateCaptcha();
      return;
    }

    if (showDonorPlaceholder) {
      alert("신청인 서명이 입력되지 않았습니다. 서명란에 서명해 주세요.");
      return;
    }

    if (type === "regular" && payMethod === "CMS") {
      if (!bankName.trim() || !bankAccount.trim() || !bankHolder.trim() || !bankBirth.trim()) {
        alert("CMS 자동이체 계좌정보의 모든 필수 항목을 입력해 주세요.");
        return;
      }
      if (showHolderPlaceholder) {
        alert("예금주 서명이 입력되지 않았습니다. 서명란에 서명해 주세요.");
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. Upload goods photo if exists
      let goodsPhotoUrl = null;
      if (type === "goods" && goodsPhoto) {
        const fileExt = goodsPhoto.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `sponsorships/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("webzine")
          .upload(filePath, goodsPhoto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("webzine")
          .getPublicUrl(filePath);

        goodsPhotoUrl = publicUrl;
      }

      // 2. Fetch base64 signature values
      const signatureData = donorCanvasRef.current?.toDataURL("image/png");
      const holderSignatureData =
        type === "regular" && payMethod === "CMS"
          ? holderCanvasRef.current?.toDataURL("image/png")
          : null;

      // Calculate numeric amount
      const finalAmount =
        type === "regular"
          ? amount === "custom"
            ? parseFloat(customAmount)
            : parseFloat(amount)
          : type === "temporary"
            ? parseFloat(goodsValuation) || null
            : null;

      // 3. Save into Supabase DB
      const payload = {
        type,
        amount: finalAmount,
        pay_method: type === "regular" ? payMethod : type === "temporary" ? "direct" : null,
        goods_desc: type === "goods" ? goodsDesc : null,
        goods_photo_url: goodsPhotoUrl,
        goods_valuation: type === "goods" ? (parseFloat(goodsValuation) || null) : null,
        amount_desc: amountDesc || null,
        name,
        phone,
        fax: fax || null,
        email: email || null,
        address_type: addressType,
        zipcode: zipcode || null,
        address: address || null,
        address_detail: addressDetail || null,
        bank_name: type === "regular" && payMethod === "CMS" ? bankName : null,
        bank_account: type === "regular" && payMethod === "CMS" ? bankAccount : null,
        bank_holder: type === "regular" && payMethod === "CMS" ? bankHolder : null,
        bank_birth: type === "regular" && payMethod === "CMS" ? bankBirth : null,
        pay_date: type === "regular" && payMethod === "CMS" ? payDate : null,
        receipt_opt: type !== "volunteer" ? receiptOpt : "none",
        jumin_no: type !== "volunteer" && receiptOpt !== "none" ? juminNo : null,
        signature_data: signatureData || null,
        holder_signature_data: holderSignatureData || null,
      };

      const { error: dbError } = await supabase.from("sponsorships").insert(payload);
      if (dbError) throw dbError;

      setStep("success");
    } catch (err: any) {
      console.error(err);
      alert(`신청 접수에 실패했습니다: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeName = (t: SponsType) => {
    switch (t) {
      case "regular":
        return "정기 후원 (매달 약정 기부)";
      case "temporary":
        return "일시 후원 (계좌 직접 송금)";
      case "goods":
        return "물품 후원 (식품, 위생용품 등 기증)";
      case "volunteer":
        return "자원 봉사 (재능기부 및 노력봉사)";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#0ea5e9] selection:text-white relative pb-24 overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#0ea5e9]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Shared Navbar */}
      <Navbar />

      {/* Header Title */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="font-mono text-xs text-[#0ea5e9] tracking-widest font-bold block uppercase">
            Sponsorship Application
          </span>
          <h1 className="text-4xl sm:text-3xl font-extrabold text-white tracking-tight leading-none font-sans">
            따뜻한 나눔 신청
          </h1>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed pt-2">
            여러분의 소중한 후원과 봉사는 발달장애인들의 독립적인 생활과 건강한 지역사회 참여를 돕는 밑거름이 됩니다. <br />
          </p>
        </div>
      </section>

      {/* Wizard Form container */}
      <main className="max-w-3xl mx-auto px-6 py-6 relative z-10">
        <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-2xl relative border-beam-active overflow-hidden">
          <div className="border-beam-container" />

          {/* Steps Progress Indicator */}
          {step !== "success" && (
            <div className="flex justify-between items-center mb-10 max-w-md mx-auto relative select-none">
              <div className="absolute h-[2px] bg-white/10 left-4 right-4 top-1/2 -translate-y-1/2 z-0" />
              <div
                className="absolute h-[2px] bg-[#0ea5e9] left-4 top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
              />

              {[1, 2, 3].map((s) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full font-mono font-bold text-xs flex items-center justify-center transition-all duration-300 border-2 ${step >= s
                      ? "bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-lg"
                      : "bg-zinc-950 border-white/10 text-white/40"
                      }`}
                  >
                    {s}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${step >= s ? "text-white" : "text-white/30"
                      }`}
                  >
                    {s === 1 ? "유형 선택" : s === 2 ? "인적 사항" : "동의서명"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* STEP 1: 유형 선택 */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#0ea5e9] rounded-full inline-block" />
                    후원 및 자원봉사 유형 선택
                  </h3>
                </div>

                {/* Grid selection cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { id: "regular", label: "정기 후원", desc: "매달 계좌 자동이체" },
                    { id: "temporary", label: "일시 후원", desc: "원할 때 직접 송금" },
                    { id: "goods", label: "물품 후원", desc: "도서, 생필품 기증" },
                    { id: "volunteer", label: "자원 봉사", desc: "재능기부 및 노력봉사" },
                  ] as const).map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setType(opt.id)}
                      className={`border p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between h-32 select-none relative group ${type === opt.id
                        ? "border-[#0ea5e9] bg-[#0ea5e9]/5 text-white"
                        : "border-white/10 bg-white/[0.01] text-white/60 hover:border-white/20"
                        }`}
                    >
                      {type === opt.id && (
                        <span className="absolute top-3 right-3 text-[#0ea5e9] text-sm">✓</span>
                      )}
                      <span className="text-2xl">
                        {opt.id === "regular" ? "📅" : opt.id === "temporary" ? "💸" : opt.id === "goods" ? "📦" : "🤝"}
                      </span>
                      <div>
                        <strong className="text-sm block font-bold text-white group-hover:text-white">{opt.label}</strong>
                        <span className="text-[10px] text-white/40 block mt-0.5">{opt.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conditional Fields based on Type */}
                {type === "regular" && (
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="reg-amount" className="text-xs font-mono text-white/50 block">
                          정기 후원 금액 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <select
                          id="reg-amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        >
                          <option value="10000">매월 10,000 원</option>
                          <option value="20000">매월 20,000 원</option>
                          <option value="30000">매월 30,000 원</option>
                          <option value="50000">매월 50,000 원</option>
                          <option value="100000">매월 100,000 원</option>
                          <option value="custom">직접 기입</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="reg-pay-method" className="text-xs font-mono text-white/50 block">
                          입금 방법 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <select
                          id="reg-pay-method"
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value as PayMethod)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        >
                          <option value="CMS">CMS 자동이체 (자동인출)</option>
                          <option value="direct">직접 송금 (직접 통장입금)</option>
                        </select>
                      </div>
                    </div>

                    {amount === "custom" && (
                      <div className="space-y-2 animate-fadeIn">
                        <label htmlFor="reg-amount-custom" className="text-xs font-mono text-white/50 block">
                          정기 금액 직접 입력 (원) <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <input
                          type="number"
                          id="reg-amount-custom"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="예: 15000"
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>
                    )}
                  </div>
                )}

                {type === "temporary" && (
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="temp-amount" className="text-xs font-mono text-white/50 block">
                        일시 후원 금액 (원) <span className="text-[#0ea5e9]">*</span>
                      </label>
                      <input
                        type="number"
                        id="temp-amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="예: 50000"
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                      />
                    </div>
                    <div className="p-4 bg-zinc-950/70 border border-white/5 rounded-xl text-left space-y-1">
                      <strong className="text-xs text-white block">NH농협은행: 301-0169-1431-71</strong>
                      <span className="text-[10px] text-white/40 block">예금주: 1004보금자리</span>
                      <span className="text-[10px] text-white/30 block">* 후원금을 위 계좌로 송금해주시면 실시간으로 기부금 영수증 처리가 완료됩니다.</span>
                    </div>
                  </div>
                )}

                {type === "goods" && (
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="goods-desc" className="text-xs font-mono text-white/50 block">
                        후원하실 물품 정보 (품목 및 수량) <span className="text-[#0ea5e9]">*</span>
                      </label>
                      <textarea
                        id="goods-desc"
                        value={goodsDesc}
                        onChange={(e) => setGoodsDesc(e.target.value)}
                        rows={3}
                        placeholder="예: 남성용 겨울 내의 10세트 / 보금자리 거주인용 동화책 20권"
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-white/50 block">
                          물품 사진 첨부 (선택사항)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            id="photo-upload"
                            className="hidden"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-lg text-xs font-mono cursor-pointer transition-colors block text-center"
                          >
                            {goodsPhoto ? "사진 변경" : "사진 선택"}
                          </label>
                          {goodsPhoto && (
                            <span className="text-[10px] text-[#0ea5e9] truncate max-w-[120px]">
                              {goodsPhoto.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="goods-val" className="text-xs font-mono text-white/50 block">
                          후원처리 희망 금액 (원, 선택사항)
                        </label>
                        <input
                          type="number"
                          id="goods-val"
                          value={goodsValuation}
                          onChange={(e) => setGoodsValuation(e.target.value)}
                          placeholder="예: 50000"
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>
                    </div>

                    {goodsPhotoPreview && (
                      <div className="h-24 w-36 relative border border-white/10 rounded-lg overflow-hidden bg-zinc-950 animate-fadeIn">
                        <img src={goodsPhotoPreview} alt="Goods Preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => { setGoodsPhoto(null); setGoodsPhotoPreview(null); }}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white font-bold p-1 rounded-full text-[8px] w-5 h-5 flex items-center justify-center transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="amount-desc" className="text-xs font-mono text-white/50 block">
                    전하고 싶은 말씀 (선택사항)
                  </label>
                  <textarea
                    id="amount-desc"
                    value={amountDesc}
                    onChange={(e) => setAmountDesc(e.target.value)}
                    rows={3}
                    placeholder="시설 이용자분들을 위한 따뜻한 격려나 요청사항을 적어주세요."
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60 leading-relaxed"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-bold px-6 py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    다음 단계 &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: 인적 사항 */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#0ea5e9] rounded-full inline-block" />
                    신청인(기부자) 정보 입력
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="spons-name" className="text-xs font-mono text-white/50 block">
                      기부자명 / 단체명 <span className="text-[#0ea5e9]">*</span>
                    </label>
                    <input
                      type="text"
                      id="spons-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="성함 혹은 단체명을 입력해 주세요."
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="spons-phone" className="text-xs font-mono text-white/50 block">
                      연락처 <span className="text-[#0ea5e9]">*</span>
                    </label>
                    <input
                      type="text"
                      id="spons-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="예: 010-1234-5678"
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="spons-fax" className="text-xs font-mono text-white/50 block">
                      팩스 번호
                    </label>
                    <input
                      type="text"
                      id="spons-fax"
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                      placeholder="예: 061-275-0767"
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="spons-email" className="text-xs font-mono text-white/50 block">
                      이메일 주소
                    </label>
                    <input
                      type="email"
                      id="spons-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="예: email@example.com"
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/50 block">
                    주소 구분
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        value="home"
                        checked={addressType === "home"}
                        onChange={() => setAddressType("home")}
                        className="accent-[#0ea5e9]"
                      />
                      자택 주소
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        value="office"
                        checked={addressType === "office"}
                        onChange={() => setAddressType("office")}
                        className="accent-[#0ea5e9]"
                      />
                      직장 주소
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/50 block">
                    우편물 주소 <span className="text-[10px] text-white/30">(기부금영수증 및 우편 수령 시 필요)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="우편번호"
                      value={zipcode}
                      readOnly
                      className="w-32 bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white/60 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors text-white"
                    >
                      우편번호 검색
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="검색된 주소"
                    value={address}
                    readOnly
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white/60 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="나머지 상세 주소를 입력하세요."
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    &larr; 이전 단계
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    다음 단계 &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 납부 방법 및 동의서명 */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#0ea5e9] rounded-full inline-block" />
                    납부 방법 및 동의·온라인 서명
                  </h3>
                </div>

                {/* CMS Banking Details Form (Regular CMS Only) */}
                {type === "regular" && payMethod === "CMS" && (
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                    <strong className="text-xs font-mono text-white block border-b border-white/5 pb-2">
                      🏦 CMS 자동이체 은행 계좌 정보 등록
                    </strong>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="cms-bank" className="text-xs font-mono text-white/50 block">
                          금융기관명 (은행명) <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <input
                          type="text"
                          id="cms-bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          required
                          placeholder="예: 농협, 신한은행"
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cms-account" className="text-xs font-mono text-white/50 block">
                          계좌번호 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <input
                          type="text"
                          id="cms-account"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          required
                          placeholder="'-' 제외하고 숫자만 입력"
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cms-holder" className="text-xs font-mono text-white/50 block">
                          예금주 성함 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <input
                          type="text"
                          id="cms-holder"
                          value={bankHolder}
                          onChange={(e) => setBankHolder(e.target.value)}
                          required
                          placeholder="계좌의 예금주명 입력"
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cms-birth" className="text-xs font-mono text-white/50 block">
                          예금주 생년월일 / 사업자번호 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <input
                          type="text"
                          id="cms-birth"
                          value={bankBirth}
                          onChange={(e) => setBankBirth(e.target.value)}
                          required
                          placeholder="주민번호 앞 6자리 또는 사업자등록번호"
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cms-date" className="text-xs font-mono text-white/50 block">
                          정기 자동 이체일 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <select
                          id="cms-date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        >
                          <option value="5일">매월 5일</option>
                          <option value="10일">매월 10일</option>
                          <option value="15일">매월 15일</option>
                          <option value="20일">매월 20일</option>
                          <option value="25일">매월 25일</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 기부금 영수증 발행 설정 (자원봉사 아닌 경우만 노출) */}
                {type !== "volunteer" && (
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                    <strong className="text-xs font-mono text-white block border-b border-white/5 pb-2">
                      📄 연말정산 기부금 소득공제 영수증 설정
                    </strong>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                        <input
                          type="radio"
                          name="receiptOpt"
                          value="personal"
                          checked={receiptOpt === "personal"}
                          onChange={() => setReceiptOpt("personal")}
                          className="accent-[#0ea5e9]"
                        />
                        개인용 발행 (주민등록번호 기재)
                      </label>
                      <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                        <input
                          type="radio"
                          name="receiptOpt"
                          value="business"
                          checked={receiptOpt === "business"}
                          onChange={() => setReceiptOpt("business")}
                          className="accent-[#0ea5e9]"
                        />
                        사업자/단체용 발행 (사업자번호 기재)
                      </label>
                      <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                        <input
                          type="radio"
                          name="receiptOpt"
                          value="none"
                          checked={receiptOpt === "none"}
                          onChange={() => setReceiptOpt("none")}
                          className="accent-[#0ea5e9]"
                        />
                        발행하지 않음
                      </label>
                    </div>

                    {receiptOpt !== "none" && (
                      <div className="space-y-2 animate-fadeIn">
                        <label htmlFor="spons-jumin" className="text-xs font-mono text-white/50 block">
                          주민등록번호 / 사업자등록번호 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <input
                          type="text"
                          id="spons-jumin"
                          value={juminNo}
                          onChange={(e) => setJuminNo(e.target.value)}
                          required
                          placeholder="소득공제 전송에 필요한 정확한 고유 식별 번호를 적어주세요."
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#0ea5e9]/60"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Consent Clauses */}
                <div className="space-y-4">
                  <div className="bg-zinc-950/70 border border-white/5 rounded-xl p-4 space-y-2">
                    <strong className="text-xs text-white block">■ 개인정보 수집 및 제3자 제공 동의 (필수)</strong>
                    <div className="text-[10px] text-white/50 leading-relaxed h-20 overflow-y-auto border border-white/5 p-2 bg-black/40 rounded">
                      - 수집항목: 성명, 생년월일, 계좌 정보, 연락처, 주소 <br />
                      - 수집목적: 기부금 영수증 국세청 전송, 자동이체 CMS 가입 대행(금융결제원, 효성FMS 제공) <br />
                      - 보존기간: 관련 세법에 의거 기부 영수증 발급일로부터 5년
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" id="agree-privacy" required className="accent-[#0ea5e9]" />
                      <label htmlFor="agree-privacy" className="text-xs text-white/80 cursor-pointer select-none">
                        상기 수집 조항 및 제3자 제공 처리에 전적으로 동의합니다.
                      </label>
                    </div>
                  </div>
                </div>

                {/* Signature pads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Signature 1: Donor */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-mono text-white/80 font-bold block">
                        신청인(기부자) 서명 <span className="text-[#0ea5e9]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => clearCanvas(donorCanvasRef, setShowDonorPlaceholder)}
                        className="text-[10px] font-mono text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        지우기 ✕
                      </button>
                    </div>

                    <div className="relative h-32 w-full border border-white/10 rounded-xl bg-zinc-950 overflow-hidden cursor-crosshair">
                      <canvas
                        id="donor-canvas"
                        ref={donorCanvasRef}
                        width={320}
                        height={128}
                        onMouseDown={(e) => startDrawing(e, donorCanvasRef, setShowDonorPlaceholder)}
                        onMouseMove={(e) => draw(e, donorCanvasRef)}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={(e) => startDrawing(e, donorCanvasRef, setShowDonorPlaceholder)}
                        onTouchMove={(e) => draw(e, donorCanvasRef)}
                        onTouchEnd={stopDrawing}
                        className="absolute inset-0 w-full h-full z-10"
                      />
                      {showDonorPlaceholder && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 select-none z-0 pointer-events-none">
                          여기에 마우스나 손가락으로 서명해 주세요.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signature 2: Holder (CMS regular only) */}
                  {type === "regular" && payMethod === "CMS" ? (
                    <div className="space-y-2 min-w-0 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-mono text-white/80 font-bold block">
                          예금주 서명 <span className="text-[#0ea5e9]">*</span>
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={copyDonorSignature}
                            className="text-[10px] font-mono text-[#0ea5e9] hover:brightness-110 transition-all cursor-pointer font-semibold"
                          >
                            기부자 서명 복사
                          </button>
                          <button
                            type="button"
                            onClick={() => clearCanvas(holderCanvasRef, setShowHolderPlaceholder)}
                            className="text-[10px] font-mono text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            지우기 ✕
                          </button>
                        </div>
                      </div>

                      <div className="relative h-32 w-full border border-white/10 rounded-xl bg-zinc-950 overflow-hidden cursor-crosshair">
                        <canvas
                          id="holder-canvas"
                          ref={holderCanvasRef}
                          width={320}
                          height={128}
                          onMouseDown={(e) => startDrawing(e, holderCanvasRef, setShowHolderPlaceholder)}
                          onMouseMove={(e) => draw(e, holderCanvasRef)}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={(e) => startDrawing(e, holderCanvasRef, setShowHolderPlaceholder)}
                          onTouchMove={(e) => draw(e, holderCanvasRef)}
                          onTouchEnd={stopDrawing}
                          className="absolute inset-0 w-full h-full z-10"
                        />
                        {showHolderPlaceholder && (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 select-none z-0 pointer-events-none">
                            여기에 마우스나 손가락으로 서명해 주세요.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-center p-6 text-center text-[10px] text-white/30 leading-normal">
                      CMS 자동이체를 선택하시면 <br />
                      계좌 예금주 출금 동의를 위한 서명창이 나타납니다.
                    </div>
                  )}
                </div>

                {/* Spam prevention math Captcha */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/60">🤖 스팸방지 퀴즈:</span>
                    <span className="text-sm font-bold text-[#0ea5e9] font-mono">{captchaNum1} + {captchaNum2} = </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="정답 입력"
                      required
                      className="w-24 bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-center text-white outline-none focus:border-[#0ea5e9]/60 font-mono"
                    />
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-xs text-white/40 hover:text-white hover:bg-white/5 border border-white/10 px-2 py-1 rounded-lg cursor-pointer"
                      title="새 퀴즈"
                    >
                      ↻
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer disabled:opacity-40 text-center"
                  >
                    &larr; 이전 단계
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-bold px-4 py-2 sm:px-8 sm:py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer shadow-lg disabled:opacity-40 text-center"
                  >
                    {submitting ? "접수 진행 중..." : "따뜻한 후원 신청 완료하기"}
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS BANNER */}
            {step === "success" && (
              <div className="text-center py-8 space-y-6 animate-fadeIn">
                <span className="text-5xl block animate-bounce">🎉</span>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">따뜻한 동참에 감사드립니다!</h3>
                  <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto">
                    여러분의 소중한 손길과 응원은 발달장애인 가족들의 가슴속에 희망의 불꽃으로 타오를 것입니다. <br />
                    신청 내역이 성공적으로 국세청 공인 시스템 연계 데이터베이스에 접수되었으며, <br />
                    담당자가 빠른 시일 내에 연락드리겠습니다.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl text-left text-xs space-y-3 max-w-md mx-auto shadow-inner">
                  <h4 className="font-bold border-b border-white/10 pb-2 text-white font-sans text-sm">신청 세부 사항 요약</h4>
                  <div className="grid grid-cols-3 gap-y-2 font-mono text-[11px] text-white/60">
                    <div>후원 유형:</div>
                    <div className="col-span-2 text-white font-sans font-bold">{getTypeName(type)}</div>

                    {type === "regular" && (
                      <>
                        <div>정기 금액:</div>
                        <div className="col-span-2 text-[#0ea5e9] font-bold">
                          {amount === "custom" ? parseFloat(customAmount).toLocaleString() : parseFloat(amount).toLocaleString()} 원
                        </div>
                        <div>납부 방식:</div>
                        <div className="col-span-2 text-white">{payMethod === "CMS" ? "CMS 자동이체 계좌 등록" : "직접 송금"}</div>
                      </>
                    )}

                    {type === "temporary" && (
                      <>
                        <div>일시 금액:</div>
                        <div className="col-span-2 text-[#0ea5e9] font-bold">{parseFloat(customAmount).toLocaleString()} 원</div>
                        <div>납부 방식:</div>
                        <div className="col-span-2 text-white">직접 계좌이체송금</div>
                      </>
                    )}

                    {type === "goods" && (
                      <>
                        <div>물품 정보:</div>
                        <div className="col-span-2 text-white font-sans">{goodsDesc}</div>
                      </>
                    )}

                    <div>신청인명:</div>
                    <div className="col-span-2 text-white font-sans font-bold">{name}님</div>

                    <div>연락처:</div>
                    <div className="col-span-2 text-white">{phone}</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setName("");
                      setPhone("");
                      setFax("");
                      setEmail("");
                      setZipcode("");
                      setAddress("");
                      setAddressDetail("");
                      setGoodsDesc("");
                      setGoodsPhoto(null);
                      setGoodsPhotoPreview(null);
                      setGoodsValuation("");
                      setAmountDesc("");
                      setBankName("");
                      setBankAccount("");
                      setBankHolder("");
                      setBankBirth("");
                      generateCaptcha();
                      setShowDonorPlaceholder(true);
                      setShowHolderPlaceholder(true);
                    }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
                  >
                    추가 후원하기
                  </button>
                  <a
                    href="/posts"
                    className="bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-bold px-8 py-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-lg block text-center"
                  >
                    웹진으로 돌아가기
                  </a>
                </div>
              </div>
            )}

          </form>
        </div>
      </main>
    </div>
  );
}

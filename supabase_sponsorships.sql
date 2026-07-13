-- ====================================================================
-- 1004 BOGUMZARI WEBZINE SPONSORSHIP TABLE SCHEMA
-- Run this in the SQL Editor of your Supabase project (https://database.new)
-- ====================================================================

-- Create the sponsorships table if it does not exist
CREATE TABLE IF NOT EXISTS public.sponsorships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'regular' (정기), 'temporary' (일시), 'goods' (물품), 'volunteer' (자원봉사)
    amount NUMERIC, -- 후원 금액
    pay_method TEXT, -- 'CMS' (자동이체), 'direct' (직접송금)
    goods_desc TEXT, -- 물품 후원 내역 설명
    goods_photo_url TEXT, -- 물품 사진 스토리지 URL
    goods_valuation NUMERIC, -- 물품 감정 금액 (옵션)
    amount_desc TEXT, -- 전하고 싶은 말씀 / 전달 사항
    name TEXT NOT NULL, -- 기부자명 / 단체명
    phone TEXT NOT NULL, -- 연락처
    fax TEXT, -- 팩스번호
    email TEXT, -- 이메일
    address_type TEXT DEFAULT 'home', -- 'home' (자택), 'office' (직장)
    zipcode TEXT, -- 우편번호
    address TEXT, -- 기본주소
    address_detail TEXT, -- 상세주소
    bank_name TEXT, -- CMS 자동이체 은행명
    bank_account TEXT, -- CMS 계좌번호
    bank_holder TEXT, -- CMS 예금주 성함
    bank_birth TEXT, -- CMS 예금주 생년월일 또는 사업자등록번호
    pay_date TEXT, -- CMS 자동이체일 (5일, 10일, 15일, 20일, 25일)
    receipt_opt TEXT DEFAULT 'personal', -- 'personal' (개인용), 'business' (사업자용), 'none' (발행불필요)
    jumin_no TEXT, -- 소득공제용 주민등록번호 또는 사업자등록번호
    signature_data TEXT, -- 신청인 온라인 서명 데이터 (Base64 Canvas URI)
    holder_signature_data TEXT, -- 예금주 온라인 서명 데이터 (Base64 Canvas URI)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to allow clean re-runs
DROP POLICY IF EXISTS "Allow public insert for sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Allow authenticated select for sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Allow authenticated all for sponsorships" ON public.sponsorships;

-- 1. Allow anyone to submit a sponsorship (insert-only for anonymous users)
CREATE POLICY "Allow public insert for sponsorships" ON public.sponsorships
    FOR INSERT WITH CHECK (true);

-- 2. Allow authenticated users (Admins) to manage sponsorships (read, update, delete)
CREATE POLICY "Allow authenticated all for sponsorships" ON public.sponsorships
    FOR ALL TO authenticated USING (true);

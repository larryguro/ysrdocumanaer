-- ============================================================
-- 의사랑 기술문서 사이트 — Sprint 3 DB 스키마
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

-- 1. profiles 테이블 (auth.users 확장)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email       TEXT,
  name        TEXT,
  role        TEXT        NOT NULL DEFAULT 'admin',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필 조회 - 인증된 사용자" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "프로필 수정 - 본인만" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 신규 사용자 가입 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. menus 테이블
CREATE TABLE IF NOT EXISTS public.menus (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id    UUID        REFERENCES public.menus(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  order_index  INTEGER     NOT NULL DEFAULT 0,
  depth        INTEGER     NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "메뉴 공개 조회" ON public.menus
  FOR SELECT USING (true);

CREATE POLICY "메뉴 수정 - 인증된 사용자" ON public.menus
  FOR ALL USING (auth.uid() IS NOT NULL);


-- 3. documents 테이블
CREATE TABLE IF NOT EXISTS public.documents (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  content     TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  menu_id     UUID        REFERENCES public.menus(id) ON DELETE SET NULL,
  created_by  UUID        REFERENCES auth.users ON DELETE SET NULL,
  updated_by  UUID        REFERENCES auth.users ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 공개 사용자: 게시된 문서만 조회 / 관리자: 전체 조회
CREATE POLICY "문서 조회" ON public.documents
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "문서 수정 - 인증된 사용자" ON public.documents
  FOR ALL USING (auth.uid() IS NOT NULL);


-- 4. document_history 테이블
CREATE TABLE IF NOT EXISTS public.document_history (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id  UUID        NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content      TEXT        NOT NULL,
  updated_by   UUID        REFERENCES auth.users ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary      TEXT
);

ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "이력 조회/추가 - 인증된 사용자" ON public.document_history
  FOR ALL USING (auth.uid() IS NOT NULL);


-- 5. Storage bucket: document-images (공개 버킷)
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-images', 'document-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "이미지 공개 조회" ON storage.objects
  FOR SELECT USING (bucket_id = 'document-images');

CREATE POLICY "이미지 업로드 - 인증된 사용자" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'document-images');

CREATE POLICY "이미지 수정 - 인증된 사용자" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'document-images');

CREATE POLICY "이미지 삭제 - 인증된 사용자" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'document-images');

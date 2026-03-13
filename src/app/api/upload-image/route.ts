import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  // Storage 경로는 ASCII 영숫자·하이픈만 허용 — 한글 등 비ASCII 제거
  const rawSlug = (formData.get('slug') as string) || '';
  const slug =
    rawSlug
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'temp';

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop() || 'png';
  const filename = `${Date.now()}.${ext}`;
  const path = `${slug}/images/${filename}`;

  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from('document-images')
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('document-images').getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const { email, name } = await request.json();

  if (!email) {
    return NextResponse.json({ error: '이메일이 필요합니다.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 초대 이메일 발송 (사용자가 비밀번호를 직접 설정)
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 프로필에 이름 업데이트
  if (data.user?.id) {
    await supabase.from('profiles').update({ name, email }).eq('id', data.user.id);
  }

  return NextResponse.json({ success: true });
}

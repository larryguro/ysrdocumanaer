import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('slug')
    .eq('status', 'published')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (doc) {
    redirect(`/docs/${doc.slug.split('/').map(encodeURIComponent).join('/')}`);
  }

  // 게시된 문서가 없으면 404 페이지
  redirect('/docs/not-found');
}

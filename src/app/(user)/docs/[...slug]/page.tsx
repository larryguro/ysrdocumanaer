import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DocumentViewer from '@/components/document/DocumentViewer';

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('title')
    .eq('slug', slugKey)
    .eq('status', 'published')
    .single();

  return {
    title: doc ? `${doc.title} | 의사랑 기술문서` : '문서를 찾을 수 없습니다',
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('title, content')
    .eq('slug', slugKey)
    .eq('status', 'published')
    .single();

  if (!doc) {
    notFound();
  }

  return <DocumentViewer content={doc.content} title={doc.title} />;
}

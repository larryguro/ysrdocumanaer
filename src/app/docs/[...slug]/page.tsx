import { notFound } from 'next/navigation';
import { MOCK_DOCUMENTS } from '@/lib/mock-data';
import DocumentViewer from '@/components/document/DocumentViewer';

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const doc = MOCK_DOCUMENTS[slugKey];

  return {
    title: doc ? `${doc.title} | 의사랑 기술문서` : '문서를 찾을 수 없습니다',
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const slugKey = slug.join('/');
  const doc = MOCK_DOCUMENTS[slugKey];

  if (!doc) {
    notFound();
  }

  return <DocumentViewer content={doc.content} title={doc.title} />;
}

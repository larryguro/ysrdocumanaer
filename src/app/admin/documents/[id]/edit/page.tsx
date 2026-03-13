import { notFound } from 'next/navigation';
import { MOCK_ADMIN_DOCUMENTS } from '@/lib/mock-data';
import DocumentForm from '@/components/admin/DocumentForm';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditPageProps) {
  const { id } = await params;
  const doc = MOCK_ADMIN_DOCUMENTS.find((d) => d.id === id);

  if (!doc) {
    notFound();
  }

  return (
    <DocumentForm
      mode="edit"
      initialTitle={doc.title}
      initialSlug={doc.slug}
      initialStatus={doc.status}
      initialMenuId={doc.menuId}
    />
  );
}

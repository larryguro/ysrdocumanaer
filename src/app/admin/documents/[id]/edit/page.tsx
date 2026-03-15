import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DocumentForm from '@/components/admin/DocumentForm';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (!doc) {
    notFound();
  }

  return (
    <DocumentForm
      mode="edit"
      documentId={doc.id}
      initialTitle={doc.title}
      initialSlug={doc.slug}
      initialContent={doc.content}
      initialStatus={doc.status as 'draft' | 'published'}
      initialMenuId={doc.menu_id ?? ''}
    />
  );
}

import { DocumentDetail } from '@/features/documents/components/document-detail';

export default function DocumentDetailPage({
  params,
}: {
  params: { documentId: string };
}) {
  return <DocumentDetail documentId={params.documentId} />;
}

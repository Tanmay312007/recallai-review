'use client';

import { PageHeader } from '@/design-system/composables/page-header';
import { Card } from '@/design-system/primitives/card';
import { EmptyState } from '@/design-system/composables/empty-state';

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Upload" description="Add documents to your knowledge base." />

      <Card variant="outlined" padding="lg">
        <EmptyState
          title="Upload a document"
          description="Drag and drop a PDF, or paste a YouTube URL to import content for flashcard generation."
          action={{ label: 'Select file', onClick: () => {} }}
        />
      </Card>
    </div>
  );
}

'use client';

import { PageHeader } from '@/design-system/composables/page-header';
import { EmptyState } from '@/design-system/composables/empty-state';
import { Button } from '@/design-system/primitives/button';
import { Card } from '@/design-system/primitives/card';

export default function DecksPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Review"
        description="Manage your decks and review flashcards."
        actions={
          <Button variant="primary" size="sm" onClick={() => {}}>
            Start Review
          </Button>
        }
      />

      <Card variant="flat" padding="lg">
        <EmptyState
          title="No decks yet"
          description="Upload a document to generate flashcards, or create a deck manually to start reviewing."
          action={{ label: 'Upload Document', onClick: () => {} }}
        />
      </Card>
    </div>
  );
}

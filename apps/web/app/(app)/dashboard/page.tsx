'use client';

import { PageHeader } from '@/design-system/composables/page-header';
import { Card } from '@/design-system/primitives/card';
import { Divider } from '@/design-system/primitives/divider';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Home"
        description="Overview of your workspace activity and quick actions."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="outlined" padding="lg" className="space-y-2">
          <p className="text-caption text-foreground-muted">Due Today</p>
          <p className="text-display text-foreground">0</p>
          <p className="text-caption text-foreground-muted">Cards to review</p>
        </Card>
        <Card variant="outlined" padding="lg" className="space-y-2">
          <p className="text-caption text-foreground-muted">Documents</p>
          <p className="text-display text-foreground">0</p>
          <p className="text-caption text-foreground-muted">Total uploaded</p>
        </Card>
        <Card variant="outlined" padding="lg" className="space-y-2">
          <p className="text-caption text-foreground-muted">Decks</p>
          <p className="text-display text-foreground">0</p>
          <p className="text-caption text-foreground-muted">Active collections</p>
        </Card>
      </div>

      <Divider />

      <Card variant="flat" padding="md">
        <h3 className="text-title text-foreground mb-2">Recent Activity</h3>
        <p className="text-sm text-foreground-muted">
          Upload a document or create a deck to get started. Your recent activity will appear here.
        </p>
      </Card>
    </div>
  );
}

'use client';

import { PageHeader } from '@/design-system/composables/page-header';
import { Card } from '@/design-system/primitives/card';
import { EmptyState } from '@/design-system/composables/empty-state';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Insights"
        description="Study streaks, daily activity, and retention trends."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card variant="outlined" padding="lg">
          <p className="text-caption text-foreground-muted mb-1">Current Streak</p>
          <p className="text-display text-foreground">0 days</p>
        </Card>
        <Card variant="outlined" padding="lg">
          <p className="text-caption text-foreground-muted mb-1">Cards Reviewed</p>
          <p className="text-display text-foreground">0</p>
        </Card>
      </div>

      <Card variant="flat" padding="lg">
        <EmptyState
          title="No data yet"
          description="Review cards consistently to build your analytics. Charts and trends will appear here."
        />
      </Card>
    </div>
  );
}

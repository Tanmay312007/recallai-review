'use client';

import { PageHeader } from '@/design-system/composables/page-header';
import { Card } from '@/design-system/primitives/card';
import { Divider } from '@/design-system/primitives/divider';
import { useTheme } from '@/design-system/theme';
import { Switch } from '@/design-system/primitives/switch';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your preferences and account."
      />

      <Card variant="flat" padding="md" className="space-y-4">
        <div>
          <h3 className="text-title text-foreground">Appearance</h3>
          <p className="text-sm text-foreground-muted mt-1">Customize how Lumora looks.</p>
        </div>
        <Divider />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Dark mode</p>
            <p className="text-sm text-foreground-muted">Toggle between dark and light themes.</p>
          </div>
          <Switch checked={theme === 'dark'} onChange={toggleTheme} label="" />
        </div>
      </Card>
    </div>
  );
}

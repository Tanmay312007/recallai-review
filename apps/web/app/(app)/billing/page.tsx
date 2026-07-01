'use client';

import { PageHeader } from '@/design-system/composables/page-header';
import { Card } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';

const PLANS = [
  { name: 'Free', price: '$0', badge: 'Current' as const, features: ['5 documents/month', 'Basic flashcards', 'Standard review'] },
  { name: 'Pro', price: '$12/mo', badge: 'Popular' as const, features: ['Unlimited documents', 'AI-powered flashcards', 'Advanced analytics', 'Priority support'] },
  { name: 'Team', price: '$29/mo', badge: 'Team' as const, features: ['Everything in Pro', 'Team collaboration', 'Shared decks', 'Admin dashboard'] },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Manage your subscription and plan." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} variant="outlined" padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title text-foreground">{plan.name}</h3>
              <Badge variant={plan.badge === 'Popular' ? 'brand' : 'default'}>{plan.badge}</Badge>
            </div>
            <p className="text-display text-foreground">{plan.price}</p>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-foreground-secondary flex items-center gap-2">
                  <svg className="h-4 w-4 text-semantic-success shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Button variant={plan.badge === 'Popular' ? 'primary' : 'outline'} size="sm" className="mt-auto">
              {plan.badge === 'Current' ? 'Current plan' : 'Upgrade'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

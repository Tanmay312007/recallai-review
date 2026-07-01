import type { QualityScore, CategoryScore } from '../types';

interface QualityScoreCardProps {
  score: QualityScore;
  compact?: boolean;
}

function getScoreLevel(overall: number): { label: string; color: string } {
  if (overall >= 0.8) return { label: 'Excellent', color: 'text-semantic-success' };
  if (overall >= 0.6) return { label: 'Good', color: 'text-semantic-success' };
  if (overall >= 0.4) return { label: 'Fair', color: 'text-semantic-warning' };
  return { label: 'Poor', color: 'text-semantic-error' };
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-semantic-success' :
    pct >= 60 ? 'bg-semantic-warning' :
    'bg-semantic-error';
  return (
    <div className="h-2 w-full rounded-full bg-bg-overlay">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryScore }) {
  const pct = Math.round(category.score * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground-muted">{category.label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <ScoreBar value={category.score} />
      {category.details.length > 0 && (
        <ul className="space-y-0.5">
          {category.details.map((d, i) => (
            <li key={i} className="text-xs text-foreground-muted">• {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function QualityScoreCard({ score, compact }: QualityScoreCardProps) {
  const { label, color } = getScoreLevel(score.overall);
  const pct = Math.round(score.overall * 100);

  return (
    <div className="rounded-lg border border-border-default bg-bg-base p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground-muted">Quality Score</span>
        <span className={`text-lg font-bold ${color}`}>{pct}%</span>
      </div>
      <div className="mb-2">
        <div className="text-xs text-foreground-muted">{label}</div>
        <ScoreBar value={score.overall} />
      </div>
      {!compact && (
        <div className="space-y-3">
          {score.categories.map((cat) => (
            <CategoryRow key={cat.category} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

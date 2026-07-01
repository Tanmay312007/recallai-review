interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-semantic-error bg-background-surface px-4 py-3">
      <p className="text-sm text-semantic-error">{message}</p>
    </div>
  );
}

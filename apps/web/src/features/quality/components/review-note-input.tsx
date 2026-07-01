import { useState } from 'react';

interface ReviewNoteInputProps {
  onSubmit: (note: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export function ReviewNoteInput({
  onSubmit,
  onCancel,
  placeholder = 'Add a review note...',
}: ReviewNoteInputProps) {
  const [note, setNote] = useState('');

  return (
    <div className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-border-default bg-bg-overlay p-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:outline-none"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-md bg-bg-overlay px-3 py-1 text-xs font-medium text-foreground-muted hover:bg-bg-elevated"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(note)}
          disabled={!note.trim()}
          className="rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

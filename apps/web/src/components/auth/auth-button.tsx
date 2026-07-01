interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export function AuthButton({
  children,
  isLoading,
  loadingText,
  disabled,
  className = '',
  ...props
}: AuthButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Auth route-group layout (PROMPT §4).
 * No sidebar — clean auth pages (login, register, reset-password).
 * The sidebar shell is in (app)/layout.tsx.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

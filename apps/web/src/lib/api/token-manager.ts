let token: string | null = null;

export const tokenManager = {
  set(t: string): void {
    token = t;
  },

  get(): string | null {
    return token;
  },

  clear(): void {
    token = null;
  },

  hasToken(): boolean {
    return token !== null;
  },
};

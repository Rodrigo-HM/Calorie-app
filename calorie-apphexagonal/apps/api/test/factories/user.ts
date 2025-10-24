export type User = {
  email: string;
  password: string;
};

export function makeUser(over: Partial<User> = {}): User {
  return {
    email: over.email ?? `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.dev`,
    password: over.password ?? "Secret123!",
  };
}

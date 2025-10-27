import type { PasswordHasher } from "../../src/module/auth/crypto/psaswor-hasher";

export const fakeHasher: PasswordHasher = {
  async hash(plain: string) {
    return `hash:${plain}`;
  },

  async compare(plain: string, hash: string) {
    return hash === `hash:${plain}`;
  },
};

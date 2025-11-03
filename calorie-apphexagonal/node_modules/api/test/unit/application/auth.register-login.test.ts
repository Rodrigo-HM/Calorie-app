import { AuthService } from "src/module/auth/application/auth.service";
import { makeUsersRepoFake } from "../../fakes/users";
import type { UserRepository } from "src/module/auth/domain/UserRepository";
import type { Hasher, TokenService } from "src/module/auth/application/ports/security";

const fakeHasher: Hasher = {
  hash: async (p) => `hash:${p}`,
  compare: async (p, h) => h === `hash:${p}`,
};

const tokenSvc: TokenService = {
  sign: () => "jwt", // síncrono
  verify: <T>() => ({} as T), // síncrono
};

describe("AuthService", () => {
  it("register + login", async () => {
    const users: UserRepository = makeUsersRepoFake();
    const auth = new AuthService(users, fakeHasher, tokenSvc, () => "1");

    const reg = await auth.register({ email: "a@b.com", password: "secret12" });
    expect(reg.accessToken).toBeDefined();
    expect(reg.user.email).toBe("a@b.com");

    const login = await auth.login({ email: "a@b.com", password: "secret12" });
    expect(login.accessToken).toBeDefined();
    expect(login.user.email).toBe("a@b.com");
  });

  it("rejects duplicate email", async () => {
    const users: UserRepository = makeUsersRepoFake();
    const auth = new AuthService(users, fakeHasher, tokenSvc, () => "2");
    await auth.register({ email: "rep@b.com", password: "secret12" });
    await expect(auth.register({ email: "rep@b.com", password: "another12" }))
      .rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });

  it("invalid credentials", async () => {
    const users: UserRepository = makeUsersRepoFake();
    const auth = new AuthService(users, fakeHasher, tokenSvc, () => "3");
    await expect(auth.login({ email: "no@exists.com", password: "x" }))
      .rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });
});
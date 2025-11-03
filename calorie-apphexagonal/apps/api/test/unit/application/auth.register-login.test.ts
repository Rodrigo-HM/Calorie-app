import { AuthService } from "src/module/auth/application/auth.service";
import { makeUsersRepoFake } from "../../fakes/users"; // antes: makeUsersRepo
import type { UserRepository } from "src/module/auth/domain/UserRepository"; // antes: application/ports
import type { PasswordHasher, TokenService } from "src/module/auth/application/ports/security";

const fakeHasher: PasswordHasher = {
  hash: async (p) => `hash:${p}`,
  compare: async (p, h) => h === `hash:${p}`,
};

const tokenSvc: TokenService = {
  sign: async () => "jwt",
  verify: async <T>() => ({}) as T,
};

describe("AuthService", () => {
  it("register + login", async () => {
    const users: UserRepository = makeUsersRepoFake();
    const auth = new AuthService(users, fakeHasher, tokenSvc, () => "1"); // ← función

    const reg = await auth.register({ email: "a@b.com", password: "secret12" }); // ← objeto
    expect(reg.token).toBeDefined();
    expect(reg.user.email).toBe("a@b.com");

    const login = await auth.login({ email: "a@b.com", password: "secret12" }); // ← objeto
    expect(login.token).toBeDefined();
    expect(login.user.email).toBe("a@b.com");
  });

  it("rejects duplicate email", async () => {
    const users: UserRepository = makeUsersRepoFake();
    const auth = new AuthService(users, fakeHasher, tokenSvc, () => "2");
    await auth.register({ email: "rep@b.com", password: "x" });
    await expect(auth.register({ email: "rep@b.com", password: "y" }))
      .rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });

  it("invalid credentials", async () => {
    const users: UserRepository = makeUsersRepoFake();
    const auth = new AuthService(users, fakeHasher, tokenSvc, () => "3");
    await expect(auth.login({ email: "no@exists.com", password: "x" }))
      .rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });
});
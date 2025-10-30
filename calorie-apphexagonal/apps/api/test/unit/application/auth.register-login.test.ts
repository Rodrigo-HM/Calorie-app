import { PasswordHasher } from "src/module/auth/aplication/ports/security";
import { makeTokenService } from "../../fakes/token";
import { makeUsersRepo } from "../../fakes/users";
import { AuthService } from "src/module/auth/aplication/auth.service";
import { UsersRepository } from "src/module/auth/aplication/ports/UserRepository";


// Fakes
const fakeHasher: PasswordHasher = {
  hash: async (p) => `hash:${p}`,
  compare: async (p, h) => h === `hash:${p}`,
};

const users: UsersRepository = makeUsersRepo();

const tokenSvc = makeTokenService();

describe("AuthService", () => {
  it("register + login feliz", async () => {
    const auth = new AuthService(users, fakeHasher, tokenSvc, "1h");
    const u = await auth.register("a@b.com", "secret12");
    expect(u).toMatchObject({ email: "a@b.com" });

    const login = await auth.login("a@b.com", "secret12");
    expect(login.user.email).toBe("a@b.com");
    expect(typeof login.token).toBe("string");
  });

  it("register falla si email ocupado", async () => {
    const auth = new AuthService(users, fakeHasher, tokenSvc, "1h");
    await auth.register("rep@b.com", "x");
    await expect(auth.register("rep@b.com", "y")).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });

  it("login falla con credenciales inválidas", async () => {
    const auth = new AuthService(users, fakeHasher, tokenSvc, "1h");
    await expect(auth.login("no@exists.com", "x")).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });
});
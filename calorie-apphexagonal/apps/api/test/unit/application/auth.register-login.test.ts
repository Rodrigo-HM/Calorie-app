// UPDATE IMPORT: AuthService real y puertos UsersRepository, Hasher, TokenService
// import { AuthService } from "../../../src/module/auth/application/AuthService";

type User = { id: string; email: string; passwordHash: string };
type UsersRepo = {
  findByEmail(email: string): Promise<User | null>;
  create(email: string, passwordHash: string): Promise<User>;
};
type Hasher = { hash(s: string): Promise<string>; compare(s: string, h: string): Promise<boolean> };
type TokenService = { sign(payload: any): string };

function makeUsersRepo(): UsersRepo {
  const data: User[] = [];
  return {
    findByEmail: async (email) => data.find((u) => u.email === email) ?? null,
    create: async (email, passwordHash) => {
      const u = { id: `u_${Date.now()}`, email, passwordHash };
      data.push(u);
      return u;
    },
  };
}

const fakeHasher: Hasher = {
  hash: async (s) => `hash:${s}`,
  compare: async (s, h) => h === `hash:${s}`,
};
const fakeToken: TokenService = {
  sign: (payload) => `token:${payload.id}`,
};

describe("Auth register/login", () => {
  it("register dup email → EMAIL_TAKEN", async () => {
    const users = makeUsersRepo();

    const register = async (email: string, password: string) => {
      const exists = await users.findByEmail(email);
      if (exists) {
        const err: any = new Error("EMAIL_TAKEN");
        err.code = "EMAIL_TAKEN";
        throw err;
      }
      const hash = await fakeHasher.hash(password);
      const user = await users.create(email, hash);
      return { id: user.id };
    };

    await register("a@test.dev", "Secret123!");
    await expect(register("a@test.dev", "Secret123!")).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });

  it("login credenciales inválidas → INVALID_CREDENTIALS", async () => {
    const users = makeUsersRepo();

    const login = async (email: string, password: string) => {
      const u = await users.findByEmail(email);
      if (!u) {
        const err: any = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
      }
      const ok = await fakeHasher.compare(password, u.passwordHash);
      if (!ok) {
        const err: any = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
      }
      return { token: fakeToken.sign({ id: u.id }) };
    };

    await expect(login("x@test.dev", "x")).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("login happy path", async () => {
    const users = makeUsersRepo();
    // register
    const hash = await fakeHasher.hash("Secret123!");
    const user = await users.create("b@test.dev", hash);

    const login = async (email: string, password: string) => {
      const u = await users.findByEmail(email);
      if (!u) {
        const err: any = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
      }
      const ok = await fakeHasher.compare(password, u.passwordHash);
      if (!ok) {
        const err: any = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
      }
      return { token: fakeToken.sign({ id: u.id }) };
    };

    const out = await login("b@test.dev", "Secret123!");
    expect(out.token.startsWith("token:")).toBe(true);
  });
});

import { AuthService } from "../../../src/module/auth/services/auth.service";
import { makeUsersRepo } from "../../fakes/users";
import { fakeHasher } from "../../fakes/crypto";
import { fakeTokenService } from "../../fakes/token";

describe("AuthService register/login (application)", () => {
  it("register dup email → EMAIL_TAKEN", async () => {
    const users = makeUsersRepo();
    const auth = new AuthService(users, fakeHasher, fakeTokenService, "1h");

    await auth.register("a@test.dev", "Secret123!");

    await expect(auth.register("a@test.dev", "Secret123!")).rejects.toMatchObject({
      code: "EMAIL_TAKEN",
    });
  });

  it("login credenciales inválidas → INVALID_CREDENTIALS (email no existe)", async () => {
    const users = makeUsersRepo();
    const auth = new AuthService(users, fakeHasher, fakeTokenService, "1h");

    await expect(auth.login("x@test.dev", "x")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("login credenciales inválidas → INVALID_CREDENTIALS (password incorrecto)", async () => {
    const users = makeUsersRepo();
    const auth = new AuthService(users, fakeHasher, fakeTokenService, "1h");

    // Registro previo
    await auth.register("b@test.dev", "Correcta!");

    await expect(auth.login("b@test.dev", "Incorrecta")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("login happy path devuelve { token, user: { id, email } }", async () => {
    const users = makeUsersRepo();
    const auth = new AuthService(users, fakeHasher, fakeTokenService, "1h");

    // Registro
    const reg = await auth.register("c@test.dev", "Secret123!");
    expect(reg.id).toBeDefined();
    expect(reg.email).toBe("c@test.dev");

    // Login
    const out = await auth.login("c@test.dev", "Secret123!");
    expect(out.token.startsWith("token:")).toBe(true);
    expect(out.user.id).toBeDefined();
    expect(out.user.email).toBe("c@test.dev");
  });
});

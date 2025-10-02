import { describe, it, expect, beforeEach } from "vitest";
import { bootstrap, authApi } from "../utils";

let app: import("express").Express;
let auth: ReturnType<typeof authApi>;

beforeEach(async () => {
  app = await bootstrap();
  auth = authApi(app);
});

describe("AuthController", () => {

  it("POST /auth/register -> 201 con id y email", async () => {
    const res = await auth.register({ email: "john@example.com", password: "StrongP@ss1" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      email: "john@example.com",
    });
    expect(res.body.passwordHash).toBeUndefined(); //asegura que no debe devolver el hash de la contraseña
  });

  it("POST /auth/register con email duplicado -> 409", async () => {
    await auth.register({ email: "dup@example.com", password: "Abc123!@#" }); //aqui lo creas
    const res = await auth.register({ email: "dup@example.com", password: "Abc123!@#" }); //aqui intentas crearlo de nuevo
    expect(res.status).toBe(409);
  });

  it("POST /auth/register faltan campos -> 400", async () => {
    await auth.register({ email: "x@y.com" }).expect(400);
    await auth.register({ password: "123" }).expect(400);
    await auth.register({}).expect(400);
  });

  it("POST /auth/login -> 200 con token y user", async () => {
    await auth.register({ email: "login@example.com", password: "S3cret!!" }); //registras al usuario

    const res = await auth.login({ email: "login@example.com", password: "S3cret!!" }); //haces login
    expect(res.status).toBe(200); //debe ser 200 OK
    expect(res.body).toMatchObject({ //la respuesta debe tener esta forma
      token: expect.any(String),
      user: { id: expect.any(String), email: "login@example.com" },
    });
    expect(typeof res.body.token).toBe("string"); //el token debe ser una cadena
    expect(res.body.token.length).toBeGreaterThan(10); //y debe tener una longitud razonable
  });

  it("POST /auth/login password incorrecto -> 401", async () => {
    await auth.register({ email: "wrongpass@example.com", password: "Correct@123" });
    const res = await auth.login({ email: "wrongpass@example.com", password: "Incorrecta" });
    expect(res.status).toBe(401);
  });

  it("POST /auth/login usuario inexistente -> 401", async () => {
    const res = await auth.login({ email: "nope@example.com", password: "whatever" });
    expect(res.status).toBe(401);
  });

});

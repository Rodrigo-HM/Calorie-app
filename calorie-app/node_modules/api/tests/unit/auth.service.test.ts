import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { auth } from "../../src/middlewares/auth";
import { mockExpress } from "../utils/helpers"; // <- import del helper

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

describe("auth middleware", () => {
  let oldEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    oldEnv = { ...process.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = oldEnv;
  });

  it("bypass en test sin token asigna req.user y llama next", () => {
    process.env.NODE_ENV = "test"; //aseguramos que estamos en modo test
    const { req, next } = mockExpress(); //sin headers

    auth(req, {}, next);
    expect(req.user).toEqual({ sub: "test-user" }); //asegura que bypass funciona
    expect(next).toHaveBeenCalled(); //asegura que el middleware llama a next() y no bloquea
  });

  it("bypass en test con token 'test' asigna req.user y llama next", () => {
    process.env.NODE_ENV = "test";
    const { req, next } = mockExpress({ authorization: "Bearer test" });

    auth(req, {}, next);
    expect(req.user).toEqual({ sub: "test-user" });
    expect(next).toHaveBeenCalled();
  });

  it("en test, token JWT válido se decodifica correctamente", () => {
    process.env.NODE_ENV = "test";
    const payload = { sub: "abc123" }; //payload del token que queremos fimrar con JWT
    const token = jwt.sign(payload, JWT_SECRET); //crea un token válido
    const { req, next } = mockExpress({ authorization: `Bearer ${token}` }); //lo pone en headers

    auth(req, {}, next);
    expect(req.user).toMatchObject(payload); //Verifica que el middleware decodificó correctamente el JWT y asignó el payload a req.user.
    expect(next).toHaveBeenCalled();
  });

  it("en test, token JWT inválido devuelve 401", () => {
    process.env.NODE_ENV = "test";
    const { req, res, next, status, json } = mockExpress({ authorization: "Bearer invalid" }); //token inválido

    auth(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled(); //asegura que no llama a next() si el token es inválido
  });

  it("modo producción sin token devuelve 401", () => {
    process.env.NODE_ENV = "production"; //al no ser "test", debe exigir token
    const { req, res, next, status, json } = mockExpress();

    auth(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "No token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("modo producción con token válido asigna req.user y llama next", () => {
    process.env.NODE_ENV = "production";
    const payload = { sub: "prod-user" };
    const token = jwt.sign(payload, JWT_SECRET);
    const { req, next } = mockExpress({ authorization: `Bearer ${token}` });

    auth(req, {}, next);
    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });

  it("modo producción con token inválido devuelve 401", () => {
    process.env.NODE_ENV = "production";
    const { req, res, next, status, json } = mockExpress({ authorization: "Bearer wrongtoken" });

    auth(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });
});

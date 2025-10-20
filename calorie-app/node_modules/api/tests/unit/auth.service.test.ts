import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildAuthMiddleware } from "../../src/middlewares/auth";
import { mockExpress } from "../utils/helpers";
import { an } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

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
process.env.NODE_ENV = "test";
const auth = buildAuthMiddleware({ verify: vi.fn(() => ({} as any)) }); // no se usa en bypass
const { req, next } = mockExpress();

auth(req, {} as any, next);
expect(req.user?.sub).toBe("test-user");
expect(next).toHaveBeenCalled();
});

it("bypass en test con token 'test' asigna req.user y llama next", () => {
process.env.NODE_ENV = "test";
const auth = buildAuthMiddleware({ verify: vi.fn(() => ({} as any)) });
const { req, next } = mockExpress({ authorization: "Bearer test" });

auth(req, {} as any, next);
expect(req.user?.sub).toBe("test-user");
expect(next).toHaveBeenCalled();
});

it("en test, token válido se decodifica y asigna payload a req.user", () => {
process.env.NODE_ENV = "test";
const payload = { sub: "abc123" };
const auth = buildAuthMiddleware({ verify: () => payload as any});
const { req, next } = mockExpress({ authorization: "Bearer cualquier-cosa" });

auth(req, {} as any, next);
expect(req.user).toMatchObject(payload);
expect(next).toHaveBeenCalled();
});

it("en test, token inválido devuelve 401", () => {
process.env.NODE_ENV = "test";
const auth = buildAuthMiddleware({ verify: () => { throw new Error("bad token"); } });
const { req, res, next, status, json } = mockExpress({ authorization: "Bearer invalid" });

auth(req, res as any, next);
expect(status).toHaveBeenCalledWith(401);
expect(json).toHaveBeenCalledWith({ error: "Token inválido" });
expect(next).not.toHaveBeenCalled();
});

it("modo producción sin token devuelve 401", () => {
process.env.NODE_ENV = "production";
const auth = buildAuthMiddleware({ verify: vi.fn(() => ({} as any)) });
const { req, res, next, status, json } = mockExpress();

auth(req, res as any, next);
expect(status).toHaveBeenCalledWith(401);
expect(json).toHaveBeenCalledWith({ error: "No token" });
expect(next).not.toHaveBeenCalled();
});

it("modo producción con token válido asigna req.user y llama next", () => {
process.env.NODE_ENV = "production";
const payload = { sub: "prod-user" };
const auth = buildAuthMiddleware({ verify: () => payload as any });
const { req, next } = mockExpress({ authorization: "Bearer valido" });

auth(req, {} as any, next);
expect(req.user).toMatchObject(payload);
expect(next).toHaveBeenCalled();
});

it("modo producción con token inválido devuelve 401", () => {
process.env.NODE_ENV = "production";
const auth = buildAuthMiddleware({ verify: () => { throw new Error("bad"); } });
const { req, res, next, status, json } = mockExpress({ authorization: "Bearer wrongtoken" });

auth(req, res as any, next);
expect(status).toHaveBeenCalledWith(401);
expect(json).toHaveBeenCalledWith({ error: "Token inválido" });
expect(next).not.toHaveBeenCalled();
});
});
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

let app: import("express").Express;

beforeEach(async () => {
const mod = await import("../../src/app");
app = mod.default;
});

it("GET /health -> ok", async () => {
const res = await request(app).get("/health");
expect(res.status).toBe(200);
expect(res.body).toEqual({ ok: true });
});
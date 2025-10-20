import request from "supertest";
import type { Express } from "express";
import { vi } from "vitest";

/**
 * Auth helpers
 */
export const authApi = (app: Express) => {
  return {
    register: (body: any) => request(app).post("/api/auth/register").send(body),
    login: (body: any) => request(app).post("/api/auth/login").send(body),
    me: (token: string = "test") =>
      request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`),
  };
};

/**
 * Foods helpers
 */
export const foodsApi = (app: Express) => {
  return {
    list: (query?: Record<string, string>) =>
      request(app).get("/api/foods").query(query || {}),
    getById: (id: string) => request(app).get(`/api/foods/${id}`),
  };
};

/**
 * Entries helpers
 */
export const entriesApi = (app: Express, token: string = "test") => {
  const auth = { Authorization: `Bearer ${token}` };
  return {
    list: () => request(app).get("/api/entries").set(auth),
    create: (body: any) => request(app).post("/api/entries").set(auth).send(body),
    remove: (id: string) =>
      request(app).delete(`/api/entries/${id}`).set(auth),
  };
};

/**
 * Goals helpers
 */
export const goalsApi = (app: Express, token: string = "test") => {
  const auth = { Authorization: `Bearer ${token}` };
  return {
    get: () => request(app).get("/api/users/me/goals").set(auth),
    put: (body: any) =>
      request(app).put("/api/users/me/goals").set(auth).send(body),
  };
};

/**
 * MockExpress
 */
export function mockExpress(headers: Record<string, string> = {}) {
  const req: any = { headers };
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res: any = { status, json };
  const next = vi.fn();
  return { req, res, next, status, json };
}
import type { Request, Response, NextFunction } from "express";
import { FoodsController } from "../../../src/module/foods/infrastructure/http/express/FoodsController";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

function makeDeps(
  foods: Array<{ id: string; name: string; kcal: number; protein: number; carbs: number; fat: number }>
) {
  return {
    listAll: async () => foods,
    getById: async (id: string) => foods.find((f) => f.id === id) ?? null,
  };
}

describe("FoodsController", () => {
  it("GET /api/foods → devuelve la lista completa", async () => {
    const deps = makeDeps([
      { id: "f1", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
    ]);
    const controller = new FoodsController(deps);
    const req = { query: {} } as any as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await controller.list(req, res, next);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "f1", name: "Chicken" }),
      ])
    );
  });

  it("GET /api/foods?search=chi → filtra por nombre (case-insensitive, trim)", async () => {
    const deps = makeDeps([
      { id: "f1", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
      { id: "f2", name: "Rice", kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 },
    ]);
    const controller = new FoodsController(deps);
    const req = { query: { search: " chI " } } as any as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await controller.list(req, res, next);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: "f1",
        name: "Chicken",
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
    ]);
  });

  it("GET /api/foods/:id inexistente → 404", async () => {
    const deps = makeDeps([]);
    const controller = new FoodsController(deps);
    const req = { params: { id: "nope" } } as any as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await controller.getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("GET /api/foods/:id existente → 200 con el item", async () => {
    const deps = makeDeps([
      { id: "f1", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
    ]);
    const controller = new FoodsController(deps);
    const req = { params: { id: "f1" } } as any as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await controller.getById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: "f1", name: "Chicken" })
    );
  });
});

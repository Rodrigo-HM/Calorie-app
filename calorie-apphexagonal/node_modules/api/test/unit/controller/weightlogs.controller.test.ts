import type { Request, Response } from "express";
import { WeightLogsController } from "src/module/weightLogs/infrastructure/http/express/WeightLogsController";
import { ZodError } from "zod";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

function makeRepo() {
  const data: any[] = [];
  return {
    async create(userId: string, log: any) {
      const item = { userId, ...log };
      data.push(item);
      return item;
    },
    async listByUser(userId: string, range?: { from?: string; to?: string }) {
      if (!range?.from && !range?.to) return data.filter(w => w.userId === userId);
      return data.filter(w => {
        const isMine = w.userId === userId;
        if (!isMine) return false;
        const d = w.dateISO.slice(0, 10);
        return (!range.from || d >= range.from) && (!range.to || d <= range.to);
      });
    },
    __peek: () => data,
  };
}

describe("WeightLogsController", () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.setSystemTime?.(undefined as any);
  });

  it("GET /users/me/weight-logs → lista sin rango", async () => {
    const repo = makeRepo();
    await repo.create("u1", { dateISO: "2025-10-20", weightKg: 79 });
    await repo.create("u2", { dateISO: "2025-10-20", weightKg: 82 });

    const ctl = new WeightLogsController(repo as any);
    const req = { user: { id: "u1" }, query: {} } as any as Request;
    const res = mockRes();
    

    await ctl.list(req, res);

    expect(res.json).toHaveBeenCalledWith([{ userId: "u1", dateISO: "2025-10-20", weightKg: 79 }]);
    
  });

  it("GET /users/me/weight-logs?from&to → pasa el rango al repo y filtra", async () => {
    const repo = makeRepo();
    await repo.create("u1", { dateISO: "2025-10-10", weightKg: 80 });
    await repo.create("u1", { dateISO: "2025-10-20", weightKg: 79 });
    await repo.create("u1", { dateISO: "2025-10-30", weightKg: 78 });

    const ctl = new WeightLogsController(repo as any);
    const req = { user: { id: "u1" }, query: { from: "2025-10-15", to: "2025-10-25" } } as any as Request;
    const res = mockRes();
   

    await ctl.list(req, res);

    expect(res.json).toHaveBeenCalledWith([{ userId: "u1", dateISO: "2025-10-20", weightKg: 79 }]);
  
  });

  it("POST /users/me/weight-logs con fecha explícita → usa esa fecha", async () => {
    const repo = makeRepo();
    const ctl = new WeightLogsController(repo as any);
    const req = { user: { id: "u1" }, body: { date: "2025-10-20T09:00:00.000Z", weightKg: 80, bodyFat: 15 } } as any as Request;
    const res = mockRes();
  

    await ctl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", dateISO: "2025-10-20T09:00:00.000Z", weightKg: 80, bodyFat: 15 })
    );
   
  });

  it("POST /users/me/weight-logs sin fecha → usa ahora (fijamos reloj virtual)", async () => {
    const fixed = new Date("2025-10-20T12:34:56.000Z");
    jest.useFakeTimers().setSystemTime(fixed);

    const repo = makeRepo();
    const ctl = new WeightLogsController(repo as any);
    const req = { user: { id: "u1" }, body: { weightKg: 81 } } as any as Request;
    const res = mockRes();


    await ctl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", dateISO: fixed.toISOString(), weightKg: 81 })
    );
 
  });

  it("POST bodyFat fuera de [0,60] → lanza ZodError y pasa por next", async () => {
    const repo = makeRepo();
    const ctl = new WeightLogsController(repo as any);
    const req = { user: { id: "u1" }, body: { weightKg: 80, bodyFat: 80 } } as any as Request;
    const res = mockRes();


    await expect(ctl.create(req, res)).rejects.toBeInstanceOf(ZodError);
  });

  it("POST weightKg no positivo → ZodError", async () => {
    const repo = makeRepo();
    const ctl = new WeightLogsController(repo as any);
    const req = { user: { id: "u1" }, body: { weightKg: -1 } } as any as Request;
    const res = mockRes();

    await expect(ctl.create(req, res)).rejects.toBeInstanceOf(ZodError);
  });
});

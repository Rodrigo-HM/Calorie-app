import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { presentWeightLog, presentWeightLogs } from "../presenters";

const QuerySchema = z
  .object({
    from: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().datetime()]).optional(),
    to: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().datetime()]).optional(),
  })
  .partial();

const CreateSchema = z.object({
  date: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().datetime()])
    .optional(),
  weightKg: z.number().positive(),
  bodyFat: z.number().min(0).max(60).optional(),
});

function normalizeRange(q: { from?: string; to?: string }) {
  // YYYY-MM-DD → expandimos a bordes inclusivos
  const fromStart = q.from
    ? /^\d{4}-\d{2}-\d{2}$/.test(q.from)
      ? `${q.from}T00:00:00.000Z`
      : q.from
    : undefined;
  const toEnd = q.to
    ? /^\d{4}-\d{2}-\d{2}$/.test(q.to)
      ? `${q.to}T23:59:59.999Z`
      : q.to
    : undefined;
  return { from: fromStart, to: toEnd };
}

export class WeightLogsController {
  constructor(
    private readonly listLogs: {
      run: (userId: string, range?: { from?: string; to?: string }) => Promise<any[]>;
    },
    private readonly createLog: {
      run: (userId: string, log: { dateISO: string; weightKg: number; bodyFat?: number }) => Promise<any>;
    }
  ) {}

  // GET /api/users/me/weight-logs?from&to
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id ?? "u1";
      const q = QuerySchema.parse(req.query ?? {});
      const range = normalizeRange(q);
      const items = await this.listLogs.run(userId, range);
      // Presenter: alias date
      return res.json(presentWeightLogs(items));
    } catch (e) {
      return next(e);
    }
  };

  // POST /api/users/me/weight-logs
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id ?? "u1";
      const b = CreateSchema.parse(req.body ?? {});

      // Normaliza fecha
      let dateISO: string;
      if (!b.date) {
        dateISO = new Date().toISOString();
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
        dateISO = `${b.date}T00:00:00.000Z`;
      } else {
        const d = new Date(b.date);
        dateISO = Number.isNaN(d.getTime()) ? `${b.date}T00:00:00.000Z` : d.toISOString();
      }

      const saved = await this.createLog.run(userId, {
        dateISO,
        weightKg: b.weightKg,
        bodyFat: b.bodyFat,
      });

      return res.status(201).json(presentWeightLog(saved));
    } catch (e) {
      return next(e);
    }
  };
}
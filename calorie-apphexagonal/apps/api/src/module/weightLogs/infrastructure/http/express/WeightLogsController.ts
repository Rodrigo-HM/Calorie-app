import { z } from "zod";
import type { IListWeightLogs, ICreateWeightLog } from "src/module/weightLogs/aplication/ports/weightlogs.usecases";

const listSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const createSchema = z.object({
  // acepta YYYY-MM-DD o ISO con zona
  date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().datetime()]).optional(),
  weightKg: z.number().positive(),
  bodyFat: z.number().min(0).max(60).optional(),
});

export class WeightLogsController {
  constructor(
    private readonly listLogs: IListWeightLogs,
    private readonly createLog: ICreateWeightLog
  ) {}

  // GET /api/users/me/weight-logs?from&to
  list = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? "u1";
    const { from, to } = listSchema.parse(req.query);
    const items = await this.listLogs.run(userId, { from, to });
    return res.json(items);
  };

  // POST /api/users/me/weight-logs
create = async (req: any, res: any) => {
  const userId = (req as any).user?.id ?? "u1";
  const b = createSchema.parse(req.body ?? {});

  // Normalización robusta:
  // - YYYY-MM-DD → YYYY-MM-DDT00:00:00.000Z (UTC fijo)
  // - ISO → toISOString()
  // - vacío → ahora (UTC)
  let dateISO: string;
  if (!b.date) {
    dateISO = new Date().toISOString();
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
    dateISO = `${b.date}T00:00:00.000Z`;
  } else {
    const d = new Date(b.date);
    dateISO = Number.isNaN(d.getTime())
      ? `${b.date}T00:00:00.000Z`
      : d.toISOString();
  }

  const saved = await this.createLog.run(userId, {
    dateISO,
    weightKg: b.weightKg,
    bodyFat: b.bodyFat,
  });

  return res.status(201).json(saved);
};
}

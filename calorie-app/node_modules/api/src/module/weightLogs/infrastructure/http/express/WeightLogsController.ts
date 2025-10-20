import { z } from 'zod';

const listSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const createSchema = z.object({
  date: z.string().datetime().optional(),
  weightKg: z.number().positive(),
  bodyFat: z.number().min(0).max(60).optional(),
});

export class WeightLogsController {
  constructor(
    private readonly logsRepo: {
      listByUser: (
        userId: string,
        range?: { from?: string; to?: string }
      ) => Promise<any[]>;
      create: (
        userId: string,
        log: { dateISO: string; weightKg: number; bodyFat?: number }
      ) => Promise<any>;
    }
  ) {}

  // GET /api/users/me/weight-logs?from&to
  list = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? 'u1';
    const { from, to } = listSchema.parse(req.query);
    const items = await this.logsRepo.listByUser(userId, { from, to });
    return res.json(items);
  };

  // POST /api/users/me/weight-logs
  create = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? 'u1';
    const b = createSchema.parse(req.body);

    const dateISO = b.date
      ? new Date(b.date).toISOString()
      : new Date().toISOString();

    const saved = await this.logsRepo.create(userId, {
      dateISO,
      weightKg: b.weightKg,
      bodyFat: b.bodyFat,
    });

    return res.status(201).json(saved);
  };
}

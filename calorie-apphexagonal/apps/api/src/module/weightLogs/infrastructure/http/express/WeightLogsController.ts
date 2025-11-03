import type { Request, Response } from "express";
import { z } from "zod";
import { presentWeightLog, presentWeightLogs } from "../presenters";
import { ListWeightLogs } from "../../../application/ListWeightLogs";
import { CreateWeightLog } from "../../../application/CreateWeightLog";

const ListSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const CreateSchema = z.object({
  date: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      z.string().datetime(),
    ])
    .optional(),
  weightKg: z.number().positive(),
  bodyFat: z.number().min(0).max(60).optional(),
});

export class WeightLogsController {
  constructor(
    private readonly listLogs: ListWeightLogs,
    private readonly createLog: CreateWeightLog
  ) {}

  list = async (req: Request, res: Response) => {
    const { from, to } = ListSchema.parse(req.query ?? {});
    const userId = (req as any).user?.id ?? "u1";

    const items = await this.listLogs.run({ userId, from, to });
    return res.json(presentWeightLogs(items));
  };

  create = async (req: Request, res: Response) => {
    const body = CreateSchema.parse(req.body ?? {});
    const userId = (req as any).user?.id ?? "u1";

    const saved = await this.createLog.run({
      userId,
      date: body.date,
      weightKg: body.weightKg,
      bodyFat: body.bodyFat,
    });

    return res.status(201).json(presentWeightLog(saved));
  };
}
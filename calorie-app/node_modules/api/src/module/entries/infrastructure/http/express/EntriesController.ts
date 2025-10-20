import { Request, Response } from 'express';
import { z } from 'zod';

const addSchema = z.object({
  foodId: z.string().min(1),
  grams: z.number().positive(),
  date: z.string().datetime().optional()
});

const listSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const updateSchema = z.object({
  grams: z.number().positive()
});

export class EntriesController {
  constructor(
    private readonly addEntry: any,
    private readonly listByDay: any,
    private readonly updateGrams: any,
    private readonly removeEntry: any
  ) {}

  list = async (req: Request, res: Response) => {
    const { date } = listSchema.parse(req.query);
    const userId = (req as any).user?.id ?? 'u1'; // ajusta a tu middleware de auth
    const data = await this.listByDay.run(userId, date);
    res.json(data);
  };

  add = async (req: Request, res: Response) => {
    const body = addSchema.parse(req.body);
    const userId = (req as any).user?.id ?? 'u1';
    const result = await this.addEntry.run({ userId, ...body });
    res.status(201).json(result);
  };

  update = async (req: Request, res: Response) => {
    const { grams } = updateSchema.parse(req.body);
    const userId = (req as any).user?.id ?? 'u1';
    const { id } = req.params;
    const item = await this.updateGrams.run(userId, id, grams);
    res.json(item);
  };

  remove = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? 'u1';
    const { id } = req.params;
    const ok = await this.removeEntry.run(userId, id);
    res.json(ok);
  };
}

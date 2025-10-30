import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type {
  ICreateEntry,
  IListEntriesByDay,
  IUpdateEntryGrams,
  IRemoveEntry,
} from "src/module/entries/aplication/ports/entries.usecases";
import { presentEntry, presentEntriesWithTotals } from "../presenters";

const AddSchema = z.object({
  foodId: z.string().min(1),
  grams: z.number().positive(),
  date: z.string().datetime().optional(), // opcional: si no viene, usamos "ahora"
});

const ListSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

const UpdateSchema = z.object({
  grams: z.number().positive(),
});

export class EntriesController {
  constructor(
    private readonly createEntry: ICreateEntry,
    private readonly listByDay: IListEntriesByDay,
    private readonly updateGramsUC: IUpdateEntryGrams,
    private readonly removeEntryUC: IRemoveEntry
  ) {}

// GET /api/entries?date=YYYY-MM-DD
list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = ListSchema.parse(req.query);
    const userId = (req as any).user?.id ?? "u1";
    const out = await this.listByDay.run(userId, date);
    return res.json(presentEntriesWithTotals(out.items, out.totals)); // ← formateado
  } catch (e) { return next(e); }
};

// POST /api/entries
add = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = AddSchema.parse(req.body ?? {});
    const userId = (req as any).user?.id ?? "u1";

    // Normalización segura:
    // - "YYYY-MM-DD" → "YYYY-MM-DDT00:00:00.000Z" (UTC fijo)
    // - ISO con zona → Date(...).toISOString()
    // - vacío → ahora (UTC)
    let dateISO: string;
    if (!body.date) {
      dateISO = new Date().toISOString();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      dateISO = `${body.date}T00:00:00.000Z`;
    } else {
      const d = new Date(body.date);
      dateISO = Number.isNaN(d.getTime())
        ? `${body.date}T00:00:00.000Z`
        : d.toISOString();
    }

    const item = await this.createEntry.run(userId, {
      foodId: body.foodId,
      grams: body.grams,
      dateISO,
    });

    return res.status(201).json(presentEntry(item));
  } catch (e) {
    return next(e);
  }
};

  // PUT /api/entries/:id
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { grams } = UpdateSchema.parse(req.body ?? {});
      const userId = (req as any).user?.id ?? "u1";
      const { id } = req.params;
      const item = await this.updateGramsUC.run(userId, id, grams);
      return res.json(item);
    } catch (e) {
      return next(e);
    }
  };

  // DELETE /api/entries/:id
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id ?? "u1";
      const { id } = req.params;
      await this.removeEntryUC.run(userId, id); // el use case devuelve void
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  };
}
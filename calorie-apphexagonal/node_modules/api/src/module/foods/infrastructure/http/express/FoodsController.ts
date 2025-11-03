import type { Request, Response } from "express";
import { z } from "zod";
import { FoodsService } from "../../../application/FoodsService";

const ListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export class FoodsController {
  constructor(private readonly service: FoodsService) {}

  list = async (req: Request, res: Response) => {
    const { search, page, pageSize } = ListQuerySchema.parse(req.query ?? {});
    const out = await this.service.list({ search, page, pageSize });
    // Compat con tests existentes: devolver array de foods, no objeto paginado
    return res.json(out.items);
  };

  getById = async (req: Request, res: Response) => {
    const item = await this.service.getById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    return res.json(item);
  };
}
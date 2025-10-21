import { Request, Response, NextFunction } from 'express';

type Food = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export class FoodsController {
  constructor(
    private readonly deps: {
      listAll: () => Promise<Food[]>;
      getById: (id: string) => Promise<Food | null>;
    }
  ) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = String(req.query.search ?? '').trim().toLowerCase();
      const items = await this.deps.listAll();
      const filtered = q ? items.filter((f) => f.name.toLowerCase().includes(q)) : items;
      return res.json(filtered);
    } catch (e) {
      return next(e);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.deps.getById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.json(item);
    } catch (e) {
      return next(e);
    }
  };
}

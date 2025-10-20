export class FoodsController {
  constructor(
    private readonly foodsRepo: {
      listAll: () => Promise<any[]>;
      getById: (id: string) => Promise<any | null>;
    }
  ) {}

  // GET /api/foods
  list = async (req: any, res: any) => {
    const data = await this.foodsRepo.listAll();
    return res.json(data);
  };

  // GET /api/foods/:id
  getById = async (req: any, res: any) => {
    const it = await this.foodsRepo.getById(req.params.id);
    if (!it) return res.status(404).json({ error: 'Not found' });
    return res.json(it);
  };
}

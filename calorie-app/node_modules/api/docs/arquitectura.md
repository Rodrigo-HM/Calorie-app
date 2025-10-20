Arquitectura (vista rápida)

Objetivo: separar responsabilidades (SOLID) y facilitar tests/cambios
Capas:
Controller: valida entrada (zod), orquesta y devuelve respuestas
Service: reglas de negocio (no sabe de HTTP ni DB)
Repository (interfaz): contrato de acceso a datos
Adapter (impl): conecta la interfaz con el modelo/DB real (LowDB)
Composition: ensambla servicio con sus dependencias (DIP)
Routes: mapea URL → controller

Diagrama (texto)

Cliente (HTTP)
↓
Routes (Express Router)
↓
Controller (valida con zod, orquesta)
↓
Service (lógica/negocio)
↓
Repository (interfaz)
↓
Adapter (impl concreta → FoodModel/LowDB)
↓
DB (LowDB JSON)

Estructura de archivos (ejemplo con Foods)

src/schemas/foods.dto.ts → zod schemas de entrada (query/params)
src/repositories/foods.read.repository.ts → interfaz de lectura
src/repositories/impl/foods-read.adapter.ts → adapter a FoodModel/DB
src/services/foods.service.ts → lógica de listado/filtrado (si aplica)
src/composition/foods.composition.ts → buildFoodsService()
src/controllers/foods.controller.ts → valida, llama al servicio, responde
src/routes/foods.routes.ts → rutas GET /api/foods y GET /api/foods/:id
src/models/food.model.ts → tu modelo actual (LowDB)

Flujo de ejemplo: GET /api/foods?search=pollo

-Router: llama a FoodsController.list
-Controller:
Valida req.query con FoodsQuerySchema
Si inválido → 400 { error: "Datos inválidos", errors }
Si OK → foodsService.list({ search, page, pageSize })
-Service:
Llama al repositorio para obtener datos
Aplica reglas (filtros, paginación si procede)
Devuelve el array (compat con el frontend)
-Controller: 200 con el array final
Ejemplo de contrato (compat con tu frontend)

Request: GET /api/foods?search=pollo
Response: 200
[
{ "id": "205db036-08f4-4a8d-bd72-0266b6bf1258", "name": "Pechuga de pollo", "kcal": 165, "protein": 31, "carbs": 0, "fat": 3.6, "createdAt": "..." },
...
]

Validación (zod) en Foods

FoodsQuerySchema:
search: string opcional
page, pageSize: números enteros con límites (si los usas)
FoodIdParamsSchema:
id: string no vacío (o uuid si lo prefieres)
Si falla: 400 { error: "Datos inválidos", errors: { fieldErrors: ... } }
Código (resumen real)

foods.dto.ts
export const FoodsQuerySchema = z.object({
search: z.string().trim().max(100).optional(),
page: z.coerce.number().int().min(1).optional().default(1),
pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const FoodIdParamsSchema = z.object({ id: z.string().min(1) });

foods.read.repository.ts
export interface FoodsReadRepository {
listAll(): Promise<Array<{ id: string; name: string; kcal: number; protein: number; carbs: number; fat: number }>>;
getById(id: string): Promise<{ id: string; name: string; kcal: number; protein: number; carbs: number; fat: number; createdAt: string } | null>;
}

foods-read.adapter.ts
export class FoodsReadAdapter implements FoodsReadRepository {
async listAll() { return FoodModel.list(); }
async getById(id: string) { return FoodModel.getById(id) ?? null; }
}

foods.service.ts (opcional si solo lees; si no, filtra/pagina aquí)
export class FoodsService {
constructor(private readonly repo: FoodsReadRepository) {}
async list({ search, page, pageSize }: { search?: string; page: number; pageSize: number }) {
const all = await this.repo.listAll();
const filtered = search ? all.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : all;
const start = (page - 1) * pageSize;
return filtered.slice(start, start + pageSize);
}
getById(id: string) { return this.repo.getById(id); }
}

foods.composition.ts
export function buildFoodsService() {
const repo = new FoodsReadAdapter();
return new FoodsService(repo);
}

foods.controller.ts
const foodsService = buildFoodsService();
export const FoodsController = {
async list(req, res) {
const parsed = FoodsQuerySchema.safeParse(req.query);
if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
const { search, page, pageSize } = parsed.data;
const items = await foodsService.list({ search, page, pageSize });
return res.status(200).json(items); // devolvemos array para no tocar el front
},
async getById(req, res) {
const parsed = FoodIdParamsSchema.safeParse(req.params);
if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
const food = await foodsService.getById(parsed.data.id);
if (!food) return res.status(404).json({ error: "No encontrado" });
return res.status(200).json(food);
},
};

foods.routes.ts
router.get("/", FoodsController.list);
router.get("/:id", FoodsController.getById);

Beneficios en una frase

Controllers simples y consistentes (zod + orquestación)
Servicios testeables con mocks de repos
Repos/Adapters intercambiables (DIP): cambiar LowDB por SQL no afecta a controllers/servicios
Contratos de error uniformes (400/404) y frontend estable
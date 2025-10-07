import { Request, RequestHandler } from "express";
import { buildWeightLogsService } from "../composition/weightLogs.composition";
import { WeightLogsListQuerySchema, CreateWeightLogSchema } from "../schemas/weightLogs.dto";

const service = buildWeightLogsService();

type AuthedRequest = Request & { user: { id: string; sub?: string; email?: string } };

const toDay = (iso: string) => iso.slice(0, 10);

export const WeightLogController: { list: RequestHandler; create: RequestHandler } = {
list: async (req, res) => {
const userId = (req as AuthedRequest).user.id;

const parsed = WeightLogsListQuerySchema.safeParse(req.query);
if (!parsed.success) {
  return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const { from, to } = parsed.data;

try {
  const range = {
    from: from ? new Date(from.length === 10 ? from + "T00:00:00.000Z" : from).toISOString() : undefined,
    to: to ? new Date(to.length === 10 ? to + "T23:59:59.999Z" : to).toISOString() : undefined,
  };
  const items = await service.list(userId, range);
  // RESPUESTA: normalizar date a YYYY-MM-DD
  const shaped = items.map(x => ({ ...x, date: toDay(x.date) }));
  return res.status(200).json(shaped);
} catch (e: any) {
  if (e?.code === "RANGE_INVALID") return res.status(400).json({ error: "Rango inválido" });
  return res.status(500).json({ error: "Error listando pesos" });
}
},

create: async (req, res) => {
const userId = (req as AuthedRequest).user.id;

const parsed = CreateWeightLogSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const { date, weightKg, bodyFat } = parsed.data;
const iso = (date ? new Date(date) : new Date()).toISOString();

try {
  const item = await service.create(userId, { dateISO: iso, weightKg, bodyFat });
  // RESPUESTA: normalizar date a YYYY-MM-DD
  return res.status(201).json({ ...item, date: toDay(item.date) });
} catch (e: any) {
  if (e?.code === "WEIGHT_OUT_OF_RANGE") {
    return res.status(400).json({ error: "weightKg fuera de rango" });
  }
  if (e?.code === "BODYFAT_OUT_OF_RANGE") {
    return res.status(400).json({ error: "bodyFat fuera de rango" });
  }
  return res.status(500).json({ error: "Error creando peso" });
}
},
};
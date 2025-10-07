import { Request, Response, RequestHandler } from "express";
import {
EntriesListQuerySchema,
CreateEntrySchema,
UpdateEntrySchema,
EntryIdParamsSchema,
} from "../schemas/entries.dto";
import { buildEntriesService } from "../composition/entries.composition";
import { FoodModel } from "../models/food.model"; // solo para totales (no para validar en create)

const service = buildEntriesService();

type AuthedRequest = Request & {
user: { id: string; sub?: string; email?: string };
};

export const listToday: RequestHandler = async (req, res) => {
const parsed = EntriesListQuerySchema.safeParse(req.query);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const userId = (req as AuthedRequest).user.id;
const day = parsed.data.date || new Date().toISOString().slice(0, 10);

const { items, totals } = await service.listWithTotals(userId, day);
return res.json({ items, totals });
};

export const create: RequestHandler = async (req, res) => {
const parsed = CreateEntrySchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const userId = (req as AuthedRequest).user.id;
const { foodId, grams, date } = parsed.data;

try {
const iso = (date ? new Date(date) : new Date()).toISOString();
const item = await service.create(userId, { foodId, grams, dateISO: iso });
return res.status(201).json(item);
} catch (e: any) {
if (e?.code === "FOOD_NOT_FOUND") {
return res.status(400).json({ error: "foodId inválido" });
}
return res.status(500).json({ error: "Error creando entry" });
}
};

export const remove: RequestHandler = async (req, res) => {
const parsed = EntryIdParamsSchema.safeParse(req.params);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const userId = (req as AuthedRequest).user.id;
try {
const removed = await service.remove(userId, parsed.data.id);
return res.json(removed);
} catch (e: any) {
if (e?.code === "NOT_FOUND") return res.status(404).json({ error: "Not found" });
return res.status(500).json({ error: "Error eliminando entry" });
}
};

export const update: RequestHandler = async (req, res) => {
const parsedParams = EntryIdParamsSchema.safeParse(req.params);
if (!parsedParams.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsedParams.error.flatten() });
}
const parsedBody = UpdateEntrySchema.safeParse(req.body);
if (!parsedBody.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsedBody.error.flatten() });
}

const userId = (req as AuthedRequest).user.id;
const id = parsedParams.data.id;
const { grams } = parsedBody.data;

try {
const item = await service.update(userId, id, grams);
return res.json(item);
} catch (e: any) {
if (e?.code === "NOT_FOUND") return res.status(404).type("text").send("Not found");
return res.status(500).json({ error: "Error actualizando entry" });
}
};
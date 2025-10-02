import { Request, Response } from "express";
import { WeightLogModel } from "../models/weightLog.model";

export const WeightLogController = {
  list(req: any, res: Response) {
    const userId = req.user.sub as string;
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;
    const items = WeightLogModel.listByUser(userId, from, to);
    res.json(items);
  },

  create(req: any, res: Response) {
    const userId = req.user.sub as string;
    const { date, weightKg, bodyFat } = req.body || {};

    if (typeof weightKg !== "number" || !Number.isFinite(weightKg) || weightKg <= 0) {
      return res.status(400).type("text").send("weightKg inválido");
    }
    if (bodyFat != null && (typeof bodyFat !== "number" || bodyFat < 0 || bodyFat > 60)) {
      return res.status(400).type("text").send("bodyFat inválido");
    }

    const log = WeightLogModel.create(userId, { date, weightKg, bodyFat });
    res.status(201).json(log);
  },
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodsController = void 0;
const food_model_1 = require("../models/food.model");
exports.FoodsController = {
    list(req, res) {
        const search = req.query.search || undefined;
        const items = food_model_1.FoodModel.list(search);
        res.json(items);
    },
    getById(req, res) {
        const f = food_model_1.FoodModel.getById(req.params.id);
        if (!f)
            return res.status(404).json({ error: "Not found" });
        res.json(f);
    }
};

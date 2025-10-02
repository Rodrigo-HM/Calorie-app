"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodModel = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
exports.FoodModel = {
    list(search) {
        db_1.db.read();
        let items = db_1.db.data.foods;
        if (search) {
            const q = search.toLowerCase().trim();
            items = items.filter(f => f.name.toLowerCase().includes(q));
        }
        return items;
    },
    getById(id) {
        db_1.db.read();
        return db_1.db.data.foods.find(f => f.id === id);
    },
    create(data) {
        db_1.db.read();
        const item = { id: (0, uuid_1.v4)(), createdAt: new Date().toISOString(), ...data };
        db_1.db.data.foods.push(item);
        db_1.db.write();
        return item;
    }
};

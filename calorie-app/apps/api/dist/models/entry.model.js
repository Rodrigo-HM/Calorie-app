"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryModel = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
exports.EntryModel = {
    listByUserAndDay(userId, dayISO) {
        db_1.db.read();
        return db_1.db.data.entries.filter(e => e.userId === userId && e.date.slice(0, 10) === dayISO.slice(0, 10));
    },
    create(userId, foodId, grams, dateISO) {
        db_1.db.read();
        const e = { id: (0, uuid_1.v4)(), userId, foodId, grams, date: dateISO };
        db_1.db.data.entries.push(e);
        db_1.db.write();
        return e;
    },
    deleteByIdForUser(id, userId) {
        db_1.db.read();
        const arr = db_1.db.data.entries;
        const idx = arr.findIndex(e => e.id === id && e.userId === userId);
        if (idx === -1)
            return null;
        const [removed] = arr.splice(idx, 1);
        db_1.db.write();
        return removed;
    }
};

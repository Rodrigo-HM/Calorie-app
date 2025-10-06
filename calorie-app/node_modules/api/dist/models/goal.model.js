"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalModel = void 0;
const db_1 = require("../db");
exports.GoalModel = {
    getByUser(userId) {
        db_1.db.read();
        return db_1.db.data.goals.find(g => g.userId === userId);
    },
    upsert(userId, patch) {
        db_1.db.read();
        let g = db_1.db.data.goals.find(x => x.userId === userId);
        if (!g) {
            g = { id: userId, userId, ...patch };
            db_1.db.data.goals.push(g);
        }
        else {
            Object.assign(g, patch);
        }
        db_1.db.write();
        return g;
    }
};

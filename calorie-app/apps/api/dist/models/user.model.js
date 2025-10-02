"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
exports.UserModel = {
    getByEmail(email) {
        db_1.db.read();
        return db_1.db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    create(email, passwordHash) {
        db_1.db.read();
        const user = { id: (0, uuid_1.v4)(), email, passwordHash, createdAt: new Date().toISOString() };
        db_1.db.data.users.push(user);
        db_1.db.write();
        return user;
    },
    getById(id) {
        db_1.db.read();
        return db_1.db.data.users.find(u => u.id === id);
    }
};

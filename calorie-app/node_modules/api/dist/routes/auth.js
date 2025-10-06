"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const r = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
// POST /api/auth/register { email, password }
r.post("/register", (req, res) => {
    db_1.db.read();
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Email y password son requeridos" });
    }
    const exists = db_1.db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists)
        return res.status(409).json({ error: "Email ya registrado" });
    const user = {
        id: (0, uuid_1.v4)(),
        email,
        passwordHash: bcryptjs_1.default.hashSync(password, 10),
        createdAt: new Date().toISOString()
    };
    db_1.db.data.users.push(user);
    db_1.db.write();
    res.status(201).json({ id: user.id, email: user.email });
});
// POST /api/auth/login { email, password }
r.post("/login", (req, res) => {
    db_1.db.read();
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: "Email y password son requeridos" });
    const user = db_1.db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !bcryptjs_1.default.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user: { id: user.id, email: user.email } });
});
exports.default = r;

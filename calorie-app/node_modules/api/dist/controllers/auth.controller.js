"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
exports.AuthController = {
    register(req, res) {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res.status(400).json({ error: "Email y password requeridos" });
        if (user_model_1.UserModel.getByEmail(email))
            return res.status(409).json({ error: "Email ya registrado" });
        const user = user_model_1.UserModel.create(email, bcryptjs_1.default.hashSync(password, 10));
        res.status(201).json({ id: user.id, email: user.email });
    },
    login(req, res) {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res.status(400).json({ error: "Email y password requeridos" });
        const user = user_model_1.UserModel.getByEmail(email);
        if (!user || !bcryptjs_1.default.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
        res.json({ token, user: { id: user.id, email: user.email } });
    }
};

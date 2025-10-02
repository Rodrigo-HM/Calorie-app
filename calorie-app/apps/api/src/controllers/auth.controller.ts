import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs"; //para hasear y comparar passwords
import jwt from "jsonwebtoken"; //para firmar y verificar tokens JWT

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"; //clave secreta para firmar y verificar tokens. En producción desde .env

export const AuthController = {
    register(req: Request, res: Response) {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).type("text").send("Email y password requeridos");
        if (UserModel.getByEmail(email)) return res.status(409).type("text").send("Email ya registrado");
        const user = UserModel.create(email, bcrypt.hashSync(password, 10));
        res.status(201).json({ id: user.id, email: user.email }); //devuelve id y email, no el passwordHash
    },
    login(req: Request, res: Response) {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).type("text").send("Email y password requeridos");
        const user = UserModel.getByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) { //si no existe el usuario o el password no coincide
        return res.status(401).type("text").send("Credenciales inválidas");
        }
        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" }); //jwt.sign(payload (sub,email), secret, options) crea un pase digital firmado para el usuario
        res.json({ token, user: { id: user.id, email: user.email } });
    }
};
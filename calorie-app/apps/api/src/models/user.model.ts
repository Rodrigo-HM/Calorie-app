import { db } from "../db";
import { v4 as uuid } from "uuid"; //para ids únicos

export type User = {  //tipo de user
id: string;
email: string;
passwordHash: string;
createdAt: string;
};

export const UserModel = {
    getByEmail(email: string): User | undefined {
        db.read(); //lee la base de datos antes de buscar, para asegurarse de tener los datos más recientes
        return (db.data!.users as User[]).find(u => u.email.toLowerCase() === email.toLowerCase()); //busca el usuario por email (ignorando mayúsculas/minúsculas) y lo devuelve o undefined si no lo encuentra
    },
    create(email: string, passwordHash: string): User {
        db.read();
        const user: User = { id: uuid(), email, passwordHash, createdAt: new Date().toISOString() }; //uuid() genera un id único
        (db.data!.users as User[]).push(user);
        db.write();
        return user;
    },
    getById(id: string): User | undefined {
        db.read();
        return (db.data!.users as User[]).find(u => u.id === id);
    }
};
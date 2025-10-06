import { db } from "../db";

export type Goal = {
id: string; // usamos userId como id
userId: string;
calories: number;
protein?: number;
carbs?: number;
fat?: number;
};

export const GoalModel = {
    getByUser(userId: string): Goal | undefined {
        db.read();
        return (db.data!.goals as Goal[]).find(g => g.userId === userId);
    },
    upsert(userId: string, patch: Omit<Goal, "id" | "userId">): Goal {
        db.read();
        let g = (db.data!.goals as Goal[]).find(x => x.userId === userId); //busca la meta del usuario
        if (!g) {
        g = { id: userId, userId, ...patch }; //si no existe, crea una nueva meta con el userId como id
        (db.data!.goals as Goal[]).push(g);
        } else {
        Object.assign(g, patch); //si existe, ACTUALIZA los campos con los datos del patch
        }
        db.write();
        return g;
    }
};
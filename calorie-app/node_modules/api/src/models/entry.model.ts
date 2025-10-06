import { db } from "../db";
import { v4 as uuid } from "uuid";

export type Entry = {
id: string;
userId: string;
foodId: string;
grams: number;
date: string; // ISO
};

export const EntryModel = {
    listByUserAndDay(userId: string, dayISO: string): Entry[] {
        db.read();
        return (db.data!.entries as Entry[]).filter(
        e => e.userId === userId && e.date.slice(0, 10) === dayISO.slice(0, 10) //compara solo la parte de la fecha (YYYY-MM-DD
        );
    },
    create(userId: string, foodId: string, grams: number, dateISO: string): Entry {
        db.read();
        const e: Entry = { id: uuid(), userId, foodId, grams, date: dateISO }; //genera id unico para la entrada
        (db.data!.entries as Entry[]).push(e);
        db.write();
        return e;
    },
    deleteByIdForUser(id: string, userId: string): Entry | null {
        db.read();
        const arr = db.data!.entries as Entry[]; //guarda todas las entradas en arr
        const idx = arr.findIndex(e => e.id === id && e.userId === userId); //busca el indice de la entrada con el id y userId dados, -1 si no la encuentra
        if (idx === -1) return null;
        const [removed] = arr.splice(idx, 1); //elimina 1 elemento desde la posicion idx y lo guarda en removed
        db.write();
        return removed;
    }
};
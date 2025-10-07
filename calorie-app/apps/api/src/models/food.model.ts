import { db } from "../database";
import { v4 as uuid } from "uuid";

export type Food = {
id: string;
name: string;
kcal: number;
protein: number;
carbs: number;
fat: number;
createdAt: string;
};

export const FoodModel = {
    list(search?: string): Food[] { //si search es undefined, lista todo. Si tiene valor, filtra por ese valor
        db.read();
        let items = db.data!.foods as Food[];
        if (search) {
        const q = search.toLowerCase().trim(); //minusculas y quita espacios al principio y al final
        items = items.filter(f => f.name.toLowerCase().includes(q)); //
        }
        return items;
    },
    getById(id: string): Food | undefined {
        db.read();
        return (db.data!.foods as Food[]).find(f => f.id === id);
    },
    create(data: Omit<Food, "id" | "createdAt">): Food { //Omit quita las propiedades id y createdAt de Food, porque se generan automaticamente
        db.read();
        const item: Food = { id: uuid(), createdAt: new Date().toISOString(), ...data };
        (db.data!.foods as Food[]).push(item);
        db.write();
        return item;
    }
};
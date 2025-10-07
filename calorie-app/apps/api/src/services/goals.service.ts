import { GoalsRepository, Goals } from "../repositories/goals.repository";

export class GoalsService {
constructor(private readonly repo: GoalsRepository) {}

async get(userId: string): Promise<Goals | null> {
return this.repo.getByUserId(userId);
}

async set(userId: string, data: { kcal: number; protein: number; carbs: number; fat: number }): Promise<Goals> {
// Aquí podrías añadir reglas de negocio (ej. rangos máximos)
return this.repo.upsert(userId, data);
}
}
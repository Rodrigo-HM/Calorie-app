import { db } from '../../../shared/infrastructure/db/database';
import type {
  Goals as DomainGoals,
  GoalsRepository as GoalsRepositoryPort,
} from '../../../goals/aplication/ports/GoalsRepository';

// Tipo interno de almacenamiento (incluye campo infra)
type StoredGoals = DomainGoals & { updatedAt: string };

export class GoalsRepositoryLowdb implements GoalsRepositoryPort {
  async get(userId: string): Promise<DomainGoals | null> {
    db.read();
    const arr = (db.data!.goals ?? []) as StoredGoals[];
    const it = arr.find(g => g.userId === userId) ?? null;
    if (!it) return null;
    // Ocultamos updatedAt al salir al puerto
    const { updatedAt: _ignore, ...plain } = it;
    return plain;
  }

  async set(userId: string, data: Omit<DomainGoals, 'userId'>): Promise<DomainGoals> {
    db.read();
    db.data!.goals ||= [];
    const arr = db.data!.goals as StoredGoals[];
    const now = new Date().toISOString();

    const i = arr.findIndex(g => g.userId === userId);
    const stored: StoredGoals = { userId, ...data, updatedAt: now };

    if (i >= 0) {
      arr[i] = { ...arr[i], ...stored };
    } else {
      arr.push(stored);
    }

    db.write();

    const { updatedAt: _ignore, ...plain } = stored;
    return plain;
  }
}
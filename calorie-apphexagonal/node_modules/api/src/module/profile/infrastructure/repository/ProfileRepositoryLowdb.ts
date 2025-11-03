import { db } from '../../../shared/infrastructure/db/database';
import type {
  Profile as DomainProfile,
  ProfileRepository as ProfileRepositoryPort,
} from '../../domain/ProfileRepository';

// Tipo interno de almacenamiento (incluye campos infra como updatedAt)
type StoredProfile = DomainProfile & { updatedAt: string };

export class ProfileRepositoryLowdb implements ProfileRepositoryPort {
  async get(userId: string): Promise<DomainProfile | null> {
    db.read();
    const arr = (db.data!.profiles ?? []) as StoredProfile[];
    const it = arr.find(p => p.userId === userId) ?? null;
    if (!it) return null;
    // Mapeo a contrato del puerto (ocultamos updatedAt)
    const { updatedAt: _ignore, ...profile } = it;
    return profile;
  }

  async update(
    userId: string,
    patch: Partial<Omit<DomainProfile, 'userId'>>
  ): Promise<DomainProfile> {
    db.read();
    db.data!.profiles ||= [];
    const arr = db.data!.profiles as StoredProfile[];
    const now = new Date().toISOString();
    const i = arr.findIndex(p => p.userId === userId);

    if (i >= 0) {
      arr[i] = { ...arr[i], ...patch, updatedAt: now };
      db.write();
      const { updatedAt: _ignore, ...profile } = arr[i];
      return profile;
    }

    const created: StoredProfile = { userId, ...patch, updatedAt: now } as StoredProfile;
    arr.push(created);
    db.write();
    const { updatedAt: _ignore, ...profile } = created;
    return profile;
  }
}
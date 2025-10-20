// AJUSTA ESTAS RUTAS a las reales en tu repo
import type { Profile as LegacyProfile } from 'src/repositories/profile.repository.ts';
import type { Profile as PortProfile } from 'src/module/profile/aplication/ports/ProfileRepository';
import { ProfileAdapter } from 'src/repositories/impl/profile.adapter';

// sex en legacy
type LegacySex = 'male' | 'female';

// sex en puerto nuevo (application)
type PortSex = 'M' | 'F' | 'O' | undefined;

/**
 * Mapea sex: legacy ("male"/"female") → puerto ("M"/"F"/"O")
 */
function legacySexToPort(sex?: LegacySex): PortSex {
  if (sex === 'male') return 'M';
  if (sex === 'female') return 'F';
  return undefined; // legacy no tiene "other" → lo dejamos undefined
}

/**
 * Mapea sex: puerto ("M"/"F"/"O"/undefined) → legacy ("male"/"female")
 * Nota: si viene "O" (other), lo omitimos (no lo soporta legacy)
 */
function portSexToLegacy(sex?: PortSex): LegacySex | undefined {
  if (sex === 'M') return 'male';
  if (sex === 'F') return 'female';
  return undefined; // 'O' o undefined → no establecer
}

/**
 * Convierte un Profile legacy a Profile del puerto (para GET)
 */
function legacyToPort(p: LegacyProfile): PortProfile {
  return {
    userId: p.userId,
    name: p.name,
    age: p.age,
    sex: legacySexToPort((p as any).sex), // p.sex es 'male'|'female'|undefined → 'M'|'F'|undefined
  };
}

/**
 * Sanea el patch del puerto y lo convierte al shape que espera tu adapter legacy en upsert
 */
function portPatchToLegacy(
  patch: Partial<Omit<PortProfile, 'userId'>>
): Omit<LegacyProfile, 'userId' | 'updatedAt'> {
  const out: Partial<Omit<LegacyProfile, 'userId' | 'updatedAt'>> = {};

  if (patch.name !== undefined) out.name = patch.name;
  if (patch.age !== undefined) out.age = patch.age;

  if (patch.sex !== undefined) {
    const sx = portSexToLegacy(patch.sex);
    if (sx !== undefined) {
      (out as any).sex = sx; // legacy: 'male' | 'female'
    }
  }

  // Si tu legacy Profile tiene más campos, mapéalos aquí
  return out as Omit<LegacyProfile, 'userId' | 'updatedAt'>;
}

/**
 * Bridge entre el repositorio legacy y el puerto (ProfileRepository)
 * Traduce datos y llamadas entre ambos dominios.
 */
export class ProfileRepositoryBridge {
  constructor(private readonly legacy: ProfileAdapter) {}

  /**
   * GET: devuelve el Profile del puerto (sex en "M"/"F"/"O"/undefined)
   */
  async get(userId: string): Promise<PortProfile | null> {
    const res = await this.legacy.getByUser(userId);
    if (!res) return null;
    return legacyToPort(res as LegacyProfile);
  }

  /**
   * UPDATE: recibe patch del puerto, lo convierte al shape legacy y llama a upsert
   */
  async update(
    userId: string,
    patch: Partial<Omit<PortProfile, 'userId'>>
  ): Promise<PortProfile> {
    const payload = portPatchToLegacy(patch);

    const saved = await this.legacy.upsert(
      userId,
      payload // El adapter espera Omit<LegacyProfile, 'userId' | 'updatedAt'>
    );

    // Devuelve el shape del puerto
    return legacyToPort(saved as LegacyProfile);
  }
}

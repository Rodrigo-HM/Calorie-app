// UPDATE IMPORT: tu caso de uso real ProfileService / UpdateProfile
// import { UpdateProfile } from "../../../src/module/profile/application/UpdateProfile";
// import type { ProfileRepository } from "../../../src/module/profile/application/ports/ProfileRepository";

type Profile = { userId: string; name?: string; age?: number; heightCm?: number };
type ProfileRepository = {
  get(userId: string): Promise<Profile | null>;
  update(userId: string, patch: Partial<Profile>): Promise<Profile>;
};

function makeProfileRepo(initial: Profile | null): ProfileRepository {
  let store = initial;
  return {
    get: async () => store,
    update: async (userId, patch) => (store = { ...(store ?? { userId }), ...patch })!,
  };
}

describe("Given a partial profile, When updating, Then merges allowed fields", () => {
  it("update name/height no toca otros campos", async () => {
    const repo = makeProfileRepo({ userId: "u1", name: "Ana", age: 30, heightCm: 170 });

    const update = async (userId: string, patch: Partial<Profile>) => {
      const allowed: (keyof Profile)[] = ["name", "age", "heightCm"];
      const safePatch: Partial<Profile> = {};
      for (const k of allowed) if (k in patch) (safePatch as any)[k] = (patch as any)[k];
      return repo.update(userId, safePatch);
    };

    const out = await update("u1", { name: "Ana María", heightCm: 171, userId: "u2" } as any);
    expect(out.name).toBe("Ana María");
    expect(out.heightCm).toBe(171);
    expect(out.age).toBe(30); // intacto
    expect(out.userId).toBe("u1"); // no se cambió
  });
});

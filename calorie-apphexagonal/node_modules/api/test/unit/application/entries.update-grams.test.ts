import { UpdateEntryGrams } from "src/module/entries/aplication/update/UpdateEntryGrams";
import type { EntriesRepository } from "src/module/entries/aplication/ports/EntriesRepository";

function makeEntriesRepo(initial: Array<{ id: string; userId: string; grams: number }> = []): EntriesRepository {
  const data = [...initial];
  return {
    async save(_e: any) {},
    async findByDay(_u: string, _d: string) { return []; },
    async updateGramsForUser(id: string, userId: string, grams: number) {
      const it = data.find(e => e.id === id && e.userId === userId);
      if (!it) return null;
      it.grams = grams;
      return it as any;
    },
    async deleteByIdForUser(_id: string, _userId: string) { return null; },
  };
}

describe("Entries.update grams (application)", () => {
  it("actualiza gramos si la entry pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new UpdateEntryGrams(repo);
    const out = await useCase.run("u1", "e1", 150);
    expect(out.grams).toBe(150);
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new UpdateEntryGrams(repo);
    await expect(useCase.run("u2", "e1", 200)).rejects.toMatchObject({ name: "DomainError" });
  });
});

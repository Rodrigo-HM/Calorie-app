import type { EntriesRepository } from "src/module/entries/aplication/ports/EntriesRepository";
import { RemoveEntry } from "src/module/entries/aplication/remove/RemoveEntry";

function makeEntriesRepo(initial: Array<{ id: string; userId: string; grams: number }> = []): EntriesRepository {
  const data = [...initial];
  return {
    async save(_e: any) {},
    async findByDay(_u: string, _d: string) { return []; },
    async updateGramsForUser() { return null; },
    async deleteByIdForUser(id: string, userId: string) {
      const idx = data.findIndex(e => e.id === id && e.userId === userId);
      if (idx === -1) return null;
      const [removed] = data.splice(idx, 1);
      return removed as any;
    },
  };
}

describe("Entries.remove (application)", () => {
  it("elimina la entry si pertenece al usuario → { ok: true }", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new RemoveEntry(repo);
    const out = await useCase.run("u1", "e1");
    expect(out).toEqual({ ok: true });
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new RemoveEntry(repo);
    await expect(useCase.run("u2", "e1")).rejects.toMatchObject({ name: "DomainError" });
  });
});

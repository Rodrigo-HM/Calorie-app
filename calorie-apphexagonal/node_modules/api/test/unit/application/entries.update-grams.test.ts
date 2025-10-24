import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";

type Entry = { id: string; userId: string; grams: number };

function makeEntriesRepo(initial: Entry[] = []): EntriesRepository {
  const data = [...initial];
  return {
    async save(_entry: any): Promise<void> {},
    async findByDay(_userId: string, _dayISO: string): Promise<any[]> { return []; },
    async updateGramsForUser(id: string, userId: string, grams: number): Promise<any | null> {
      const it = data.find(e => e.id === id && e.userId === userId);
      if (!it) return null;
      it.grams = grams;
      return it;
    },
    async deleteByIdForUser(_id: string, _userId: string): Promise<any | null> { return null; },
  };
}

describe("Entries.update grams", () => {
  it("actualiza gramos si la entry pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);

    const update = async (userId: string, id: string, grams: number) => {
      const res = await repo.updateGramsForUser(id, userId, grams);
      if (!res) { const err: any = new Error("NOT_FOUND"); err.code = "NOT_FOUND"; throw err; }
      return res;
    };

    const out = await update("u1", "e1", 150);
    expect(out.grams).toBe(150);
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);

    const update = async () => {
      const res = await repo.updateGramsForUser("e1", "u2", 200);
      if (!res) { const err: any = new Error("NOT_FOUND"); err.code = "NOT_FOUND"; throw err; }
      return res;
    };

    await expect(update()).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

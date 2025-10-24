import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";

type Entry = { id: string; userId: string; grams: number };

function makeEntriesRepo(initial: Entry[] = []): EntriesRepository {
  const data = [...initial];
  return {
    async save(_entry: any): Promise<void> {},
    async findByDay(_userId: string, _dayISO: string): Promise<any[]> { return []; },
    async updateGramsForUser(_id: string, _userId: string, _grams: number): Promise<any | null> { return null; },
    async deleteByIdForUser(id: string, userId: string): Promise<any | null> {
      const idx = data.findIndex(e => e.id === id && e.userId === userId);
      if (idx === -1) return null;
      const [removed] = data.splice(idx, 1);
      return removed;
    },
  };
}

describe("Entries.remove", () => {
  it("elimina la entry si pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);

    const remove = async (userId: string, id: string) => {
      const res = await repo.deleteByIdForUser(id, userId);
      if (!res) { const err: any = new Error("NOT_FOUND"); err.code = "NOT_FOUND"; throw err; }
      return res;
    };

    const out = await remove("u1", "e1");
    expect(out.id).toBe("e1");
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);

    const remove = async () => {
      const res = await repo.deleteByIdForUser("e1", "u2");
      if (!res) { const err: any = new Error("NOT_FOUND"); err.code = "NOT_FOUND"; throw err; }
      return res;
    };

    await expect(remove()).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

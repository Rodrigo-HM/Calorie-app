import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";

function makeRepoSpy() {
  const saved: any[] = [];
  const repo: EntriesRepository = {
    async save(entry: any): Promise<void> { saved.push(entry); },
    async findByDay(_userId: string, _dayISO: string): Promise<any[]> { return []; },
    async updateGramsForUser(_id: string, _userId: string, _grams: number): Promise<any | null> { return null; },
    async deleteByIdForUser(_id: string, _userId: string): Promise<any | null> { return null; },
  };
  return { repo, saved };
}

describe("Entries.create", () => {
  it("llama a repo.save con { userId, foodId, grams, dateISO }", async () => {
    const { repo, saved } = makeRepoSpy();

    // Si tienes CreateEntry real, úsalo aquí:
    // const useCase = new CreateEntry(repo, foodsRepo);
    // await useCase.run("u1", { foodId:"food_x", grams:150, dateISO:"2025-10-20T10:00:00.000Z" });

    // stub mínimo del use case:
    const create = async (userId: string, p: { foodId: string; grams: number; dateISO: string }) => {
      const entry = { id: "e1", userId, ...p };
      await repo.save(entry);
      return entry;
    };

    const payload = { foodId: "food_x", grams: 150, dateISO: "2025-10-20T10:00:00.000Z" };
    const out = await create("u1", payload);

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ userId: "u1", ...payload });
    expect(out.id).toBe("e1");
  });
});

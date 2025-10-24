import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";

function makeRepoWithSpy(returned: any[]) {
  const calls: Array<[string, string]> = [];
  const repo: EntriesRepository = {
    async save(_entry: any): Promise<void> {},
    async findByDay(userId: string, dayISO: string): Promise<any[]> {
      calls.push([userId, dayISO]);
      return returned;
    },
    async updateGramsForUser(_id: string, _userId: string, _grams: number): Promise<any | null> { return null; },
    async deleteByIdForUser(_id: string, _userId: string): Promise<any | null> { return null; },
  };
  return { repo, calls };
}

describe("Entries.findByDay", () => {
  it("delegates a repo.findByDay y devuelve su resultado", async () => {
    const expected = [
      { id: "e1", userId: "u1", foodId: "food1", grams: 100, date: "2025-10-20T08:00:00.000Z" },
      { id: "e2", userId: "u1", foodId: "food2", grams: 200, date: "2025-10-20T13:00:00.000Z" },
    ];
    const { repo, calls } = makeRepoWithSpy(expected);

    // si tienes tu caso de uso real: const out = await listByDay.run("u1","2025-10-20");
    const list = async (userId: string, dayISO: string) => repo.findByDay(userId, dayISO);
    const out = await list("u1", "2025-10-20");

    expect(calls).toEqual([["u1", "2025-10-20"]]);
    expect(out).toEqual(expected);
  });
});

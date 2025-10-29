import { ListWeightLogs } from "../../../src/module/weightLogs/aplication/ListWeightLogs";

function makeRepo(data: any[]) {
  return {
    async listByUser(userId: string, range?: { from?: string; to?: string }) {
      const all = data.filter((x) => x.userId === userId);
      if (!range?.from && !range?.to) return all;

      return all.filter((w) => {
        const d = w.dateISO.slice(0, 10);
        return (
          (!range.from || d >= range.from) && (!range.to || d <= range.to)
        );
      });
    },
  };
}

describe("ListWeightLogs (application)", () => {
  it("from > to → RANGE_INVALID", async () => {
    const uc = new ListWeightLogs(makeRepo([]) as any);
    await expect(
      uc.run("u1", { from: "2025-10-20", to: "2025-10-10" })
    ).rejects.toMatchObject({ code: "RANGE_INVALID" });
  });

  it("filtra inclusivo", async () => {
    const repo = makeRepo([
      { userId: "u1", dateISO: "2025-10-10", weightKg: 80 },
      { userId: "u1", dateISO: "2025-10-20", weightKg: 79 },
      { userId: "u1", dateISO: "2025-10-30", weightKg: 78 },
      { userId: "u2", dateISO: "2025-10-20", weightKg: 82 },
    ]);

    const uc = new ListWeightLogs(repo as any);
    const out = await uc.run("u1", { from: "2025-10-15", to: "2025-10-25" });
    expect(out).toEqual([
      { userId: "u1", dateISO: "2025-10-20", weightKg: 79 },
    ]);
  });
});

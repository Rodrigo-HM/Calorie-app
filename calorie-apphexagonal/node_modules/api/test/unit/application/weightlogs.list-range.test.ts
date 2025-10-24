import type {
  WeightLogsRepository,
  WeightLog,
} from "../../../src/module/weightLogs/aplication/ports/WeightLogsRepository";

// Fake repo que implementa EXACTAMENTE la interfaz real
function makeRepo(initial: WeightLog[]): WeightLogsRepository {
  const data = [...initial];
  return {
    async create(userId, log) {
      const item = { userId, ...log } as WeightLog;
      data.push(item);
      return item;
    },
    async listByUser(userId, range) {
      const all = data.filter((w) => w.userId === userId);
      if (!range?.from && !range?.to) return all;
      return all.filter((w) => {
        const d = w.dateISO.slice(0, 10); // YYYY-MM-DD
        return (!range.from || d >= range.from) && (!range.to || d <= range.to);
      });
    },
  };
}

describe("Given from/to, When listing weight logs, Then guards and filters apply", () => {
  it("guard: from > to → RANGE_INVALID", async () => {
    // Arrange
    const repo = makeRepo([]);

    // Use case inline (sustituye por tu ListWeightLogs real si lo tienes)
    const list = async (userId: string, range?: { from?: string; to?: string }) => {
      if (range?.from && range?.to && range.from > range.to) {
        const err: any = new Error("RANGE_INVALID");
        err.code = "RANGE_INVALID";
        throw err;
      }
      return repo.listByUser(userId, range);
    };

    // Act + Assert
    await expect(list("u1", { from: "2025-10-20", to: "2025-10-10" })).rejects.toMatchObject({
      code: "RANGE_INVALID",
    });
  });

  it("happy path: filtra logs dentro de [from, to]", async () => {
    // Arrange
    const repo = makeRepo([
      { userId: "u1", dateISO: "2025-10-10", weightKg: 80 },
      { userId: "u1", dateISO: "2025-10-20", weightKg: 79 },
      { userId: "u1", dateISO: "2025-10-30", weightKg: 78 },
      { userId: "u2", dateISO: "2025-10-20", weightKg: 82 },
    ]);

    const list = async (userId: string, range?: { from?: string; to?: string }) =>
      repo.listByUser(userId, range);

    // Act
    const out = await list("u1", { from: "2025-10-15", to: "2025-10-25" });

    // Assert
    expect(out).toEqual([{ userId: "u1", dateISO: "2025-10-20", weightKg: 79 }]);
  });
});

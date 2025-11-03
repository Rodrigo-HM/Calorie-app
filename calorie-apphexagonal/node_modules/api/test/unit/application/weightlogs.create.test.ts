import { CreateWeightLog } from "src/module/weightLogs/application/CreateWeightLog";
import { WeightLog } from "src/module/weightLogs/domain/WeightLog";

function makeRepo() {
  return {
    async create(log: WeightLog) {
      // Devolvemos la propia entidad (simula persistencia)
      return log;
    },
    async listByUser() {
      return [];
    },
  };
}

const ids = { nextId: () => "wl_1" };
const clock = { now: () => new Date("2025-10-20T10:00:00.000Z") };

describe("CreateWeightLog (application)", () => {
  it("happy path", async () => {
    const uc = new CreateWeightLog(makeRepo() as any, ids, clock);
    const out = await uc.run({
      userId: "u1",
      date: "2025-10-20T10:00:00.000Z",
      weightKg: 80,
      bodyFat: 15,
    });
    expect(out.userId).toBe("u1");
    expect(out.weightKg).toBe(80);
    expect(out.bodyFat).toBe(15);
    expect(out.dateISO).toBe("2025-10-20T10:00:00.000Z");
    expect(out.id).toBe("wl_1");
  });

  it("si no se pasa date, usa Clock.now() normalizado a ISO", async () => {
    const uc = new CreateWeightLog(makeRepo() as any, ids, clock);
    const out = await uc.run({
      userId: "u1",
      weightKg: 82.3,
    });
    expect(out.dateISO).toBe("2025-10-20T10:00:00.000Z");
    expect(out.weightKg).toBe(82.3);
  });

  it("weightKg fuera de rango → WEIGHT_OUT_OF_RANGE", async () => {
    const uc = new CreateWeightLog(makeRepo() as any, ids, clock);
    await expect(
      uc.run({ userId: "u1", date: "2025-10-20", weightKg: 10 })
    ).rejects.toMatchObject({ code: "WEIGHT_OUT_OF_RANGE" });

    await expect(
      uc.run({ userId: "u1", date: "2025-10-20", weightKg: 401 })
    ).rejects.toMatchObject({ code: "WEIGHT_OUT_OF_RANGE" });
  });

  it("bodyFat fuera de rango → BODYFAT_OUT_OF_RANGE", async () => {
    const uc = new CreateWeightLog(makeRepo() as any, ids, clock);
    await expect(
      uc.run({ userId: "u1", date: "2025-10-20", weightKg: 80, bodyFat: 80 })
    ).rejects.toMatchObject({ code: "BODYFAT_OUT_OF_RANGE" });
  });
});
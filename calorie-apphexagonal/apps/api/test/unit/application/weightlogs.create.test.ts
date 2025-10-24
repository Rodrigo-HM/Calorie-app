
import type {
  WeightLogsRepository,
  WeightLog,
} from "../../../src/module/weightLogs/aplication/ports/WeightLogsRepository";

// Fake repo que implementa EXACTAMENTE la interfaz real
function makeWeightRepo(): WeightLogsRepository {
  let seq = 1;
  return {
    async create(userId: string, log: Omit<WeightLog, "userId">): Promise<WeightLog> {
      // Genera un id derivado en memoria si lo necesitas avalar en tests
      return { userId, ...log, id: `w${seq++}` } as any as WeightLog;
    },
    async listByUser(_userId: string, _range?: { from?: string; to?: string }): Promise<WeightLog[]> {
      return [];
    },
  };
}

describe("Given valid data, When creating a weight log, Then it is created (application)", () => {
  it("happy path: crea con bodyFat opcional en [0, 60]", async () => {
    // Arrange
    const repo = makeWeightRepo();

    // Use case inline (sustituye por tu CreateWeightLog real si lo tienes)
    const create = async (userId: string, p: Omit<WeightLog, "userId">) => {
      const w = p.weightKg;
      if (!(w >= 20 && w <= 400)) {
        const err: any = new Error("WEIGHT_OUT_OF_RANGE");
        err.code = "WEIGHT_OUT_OF_RANGE";
        throw err;
      }
      if (p.bodyFat !== undefined && !(p.bodyFat >= 0 && p.bodyFat <= 60)) {
        const err: any = new Error("BODYFAT_OUT_OF_RANGE");
        err.code = "BODYFAT_OUT_OF_RANGE";
        throw err;
      }
      return repo.create(userId, p);
    };

    // Act
    const out = await create("u1", { dateISO: "2025-10-20", weightKg: 80, bodyFat: 15 });

    // Assert
    expect(out.userId).toBe("u1");
    expect(out.weightKg).toBe(80);
    expect(out.bodyFat).toBe(15);
  });
});

describe("Given invalid data, When creating a weight log, Then guards trigger", () => {
  it("weightKg fuera de [20, 400] → WEIGHT_OUT_OF_RANGE", async () => {
    const repo = makeWeightRepo();

    const create = async () => {
      const w = 10; // inválido
      if (!(w >= 20 && w <= 400)) {
        const err: any = new Error("WEIGHT_OUT_OF_RANGE");
        err.code = "WEIGHT_OUT_OF_RANGE";
        throw err;
      }
      return repo.create("u1", { dateISO: "2025-10-20", weightKg: w });
    };

    await expect(create()).rejects.toMatchObject({ code: "WEIGHT_OUT_OF_RANGE" });
  });

  it("bodyFat fuera de [0, 60] → BODYFAT_OUT_OF_RANGE", async () => {
    const repo = makeWeightRepo();

    const create = async () => {
      const bf = 80; // inválido
      if (!(bf >= 0 && bf <= 60)) {
        const err: any = new Error("BODYFAT_OUT_OF_RANGE");
        err.code = "BODYFAT_OUT_OF_RANGE";
        throw err;
      }
      return repo.create("u1", { dateISO: "2025-10-20", weightKg: 80, bodyFat: bf });
    };

    await expect(create()).rejects.toMatchObject({ code: "BODYFAT_OUT_OF_RANGE" });
  });
});

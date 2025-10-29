import { CreateWeightLog } from "../../../src/module/weightLogs/aplication/CreateWeightLog";

function makeRepo() {
  return {
    async create(userId: string, log: any) {
      return { userId, ...log };
    },
  };
}

describe("CreateWeightLog (application)", () => {
  it("happy path", async () => {
    const uc = new CreateWeightLog(makeRepo() as any);
    const out = await uc.run("u1", {
      dateISO: "2025-10-20T10:00:00.000Z",
      weightKg: 80,
      bodyFat: 15,
    });
    expect(out.weightKg).toBe(80);
    expect(out.bodyFat).toBe(15);
  });

  it("weightKg fuera de rango → WEIGHT_OUT_OF_RANGE", async () => {
    const uc = new CreateWeightLog(makeRepo() as any);
    await expect(
      uc.run("u1", { dateISO: "2025-10-20", weightKg: 10 })
    ).rejects.toMatchObject({ code: "WEIGHT_OUT_OF_RANGE" });

    await expect(
      uc.run("u1", { dateISO: "2025-10-20", weightKg: 401 })
    ).rejects.toMatchObject({ code: "WEIGHT_OUT_OF_RANGE" });
  });

  it("bodyFat fuera de rango → BODYFAT_OUT_OF_RANGE", async () => {
    const uc = new CreateWeightLog(makeRepo() as any);
    await expect(
      uc.run("u1", { dateISO: "2025-10-20", weightKg: 80, bodyFat: 80 })
    ).rejects.toMatchObject({ code: "BODYFAT_OUT_OF_RANGE" });
  });
});

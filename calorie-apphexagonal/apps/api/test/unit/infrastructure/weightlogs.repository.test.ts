import { WeightLogsRepository } from "../../../src/module/weightLogs/infrastructure/repository/WeightLogsRepository";
import { db } from "../../../src/module/shared/infrastructure/db/database";

type WeightLog = {
  id: string;
  userId: string;
  dateISO: string;
  weightKg: number;
  bodyFat?: number;
  createdAt: string;
};

describe("WeightLogsRepository (infra)", () => {
  let repo: WeightLogsRepository;

  beforeEach(() => {
    // Asegura estado limpio en el mock de lowdb
    db.read();
    (db.data as any).weightLogs = [];
    db.write();
    repo = new WeightLogsRepository();
  });

  it("create: guarda un log con los campos dados", async () => {
    // Arrange
    const payload = {
      id: "w1",
      dateISO: "2025-10-20T09:00:00.000Z",
      weightKg: 80,
      bodyFat: 15,
      createdAt: "2025-10-20T09:00:00.000Z",
    };

    // Act
    const out = await repo.create("u1", payload);

    // Assert
    expect(out.userId).toBe("u1");
    expect(out.id).toBe("w1");
    expect(out.weightKg).toBe(80);
    expect(out.bodyFat).toBe(15);

    // Verifica que quedó persistido
    db.read();
    const arr = (db.data!.weightLogs as WeightLog[]) || [];
    expect(arr).toHaveLength(1);
    expect(arr[0]).toMatchObject({ userId: "u1", ...payload });
  });

  it("listByUser: sin rango devuelve todos los logs del usuario", async () => {
    // Arrange
    await repo.create("u1", {
      id: "w1",
      dateISO: "2025-10-10T00:00:00.000Z",
      weightKg: 80,
      createdAt: "2025-10-10T00:00:00.000Z",
    });
    await repo.create("u1", {
      id: "w2",
      dateISO: "2025-10-20T12:00:00.000Z",
      weightKg: 79,
      createdAt: "2025-10-20T12:00:00.000Z",
    });
    await repo.create("u2", {
      id: "w3",
      dateISO: "2025-10-20T12:00:00.000Z",
      weightKg: 82,
      createdAt: "2025-10-20T12:00:00.000Z",
    });

    // Act
    const out = await repo.listByUser("u1");

    // Assert
    expect(out.map((x) => x.id)).toEqual(["w1", "w2"]);
  });

  it("listByUser: from en YYYY-MM-DD se interpreta como T00:00:00.000Z (inclusivo)", async () => {
    // Arrange
    await repo.create("u1", {
      id: "w1",
      dateISO: "2025-10-19T23:59:59.999Z",
      weightKg: 80,
      createdAt: "2025-10-19T23:59:59.999Z",
    });
    await repo.create("u1", {
      id: "w2",
      dateISO: "2025-10-20T00:00:00.000Z",
      weightKg: 79,
      createdAt: "2025-10-20T00:00:00.000Z",
    });
    await repo.create("u1", {
      id: "w3",
      dateISO: "2025-10-20T12:00:00.000Z",
      weightKg: 78,
      createdAt: "2025-10-20T12:00:00.000Z",
    });

    // Act
    const out = await repo.listByUser("u1", { from: "2025-10-20" });

    // Assert
    expect(out.map((x) => x.id)).toEqual(["w2", "w3"]);
  });

  it("listByUser: to en YYYY-MM-DD se interpreta como T23:59:59.999Z (inclusivo)", async () => {
    // Arrange
    await repo.create("u1", {
      id: "w1",
      dateISO: "2025-10-20T00:00:00.000Z",
      weightKg: 80,
      createdAt: "2025-10-20T00:00:00.000Z",
    });
    await repo.create("u1", {
      id: "w2",
      dateISO: "2025-10-20T23:59:59.999Z",
      weightKg: 79,
      createdAt: "2025-10-20T23:59:59.999Z",
    });
    await repo.create("u1", {
      id: "w3",
      dateISO: "2025-10-21T00:00:00.000Z",
      weightKg: 78,
      createdAt: "2025-10-21T00:00:00.000Z",
    });

    // Act
    const out = await repo.listByUser("u1", { to: "2025-10-20" });

    // Assert
    expect(out.map((x) => x.id)).toEqual(["w1", "w2"]);
  });

  it("listByUser: combina from y to (ambos inclusivos)", async () => {
    // Arrange
    await repo.create("u1", {
      id: "w1",
      dateISO: "2025-10-10T00:00:00.000Z",
      weightKg: 80,
      createdAt: "2025-10-10T00:00:00.000Z",
    });
    await repo.create("u1", {
      id: "w2",
      dateISO: "2025-10-20T12:00:00.000Z",
      weightKg: 79,
      createdAt: "2025-10-20T12:00:00.000Z",
    });
    await repo.create("u1", {
      id: "w3",
      dateISO: "2025-10-30T23:59:59.999Z",
      weightKg: 78,
      createdAt: "2025-10-30T23:59:59.999Z",
    });
    await repo.create("u1", {
      id: "w4",
      dateISO: "2025-11-01T00:00:00.000Z",
      weightKg: 77,
      createdAt: "2025-11-01T00:00:00.000Z",
    });

    // Act
    const out = await repo.listByUser("u1", { from: "2025-10-20", to: "2025-10-30" });

    // Assert
    expect(out.map((x) => x.id)).toEqual(["w2", "w3"]);
  });
});

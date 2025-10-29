export class CreateWeightLog {
  constructor(
    private readonly repo: {
      create: (
        userId: string,
        log: { dateISO: string; weightKg: number; bodyFat?: number }
      ) => Promise<any>;
    }
  ) {}

  async run(
    userId: string,
    input: { dateISO: string; weightKg: number; bodyFat?: number }
  ) {
    const { dateISO, weightKg, bodyFat } = input;

    if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400) {
      const err: any = new Error("WEIGHT_OUT_OF_RANGE");
      err.code = "WEIGHT_OUT_OF_RANGE";
      throw err;
    }

    if (
      bodyFat != null &&
      (!Number.isFinite(bodyFat) || bodyFat < 0 || bodyFat > 60)
    ) {
      const err: any = new Error("BODYFAT_OUT_OF_RANGE");
      err.code = "BODYFAT_OUT_OF_RANGE";
      throw err;
    }

    return this.repo.create(userId, { dateISO, weightKg, bodyFat });
  }
}

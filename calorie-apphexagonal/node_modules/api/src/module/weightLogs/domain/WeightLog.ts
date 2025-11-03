export type WeightLogCreateProps = {
  id: string;
  userId: string;
  dateISO: string;     // YYYY-MM-DD o ISO completo
  weightKg: number;
  bodyFat?: number;    // %
  createdAt?: string;
};

export class WeightLog {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dateISO: string,
    public readonly weightKg: number,
    public readonly createdAt: string,
    public readonly bodyFat?: number
  ) {}

  static create(props: WeightLogCreateProps) {
    if (!props.userId) throw Object.assign(new Error("USER_REQUIRED"), { code: "USER_REQUIRED" });
    if (typeof props.dateISO !== "string" || props.dateISO.length < 10) {
      throw Object.assign(new Error("DATE_INVALID"), { code: "DATE_INVALID" });
    }
    if (!Number.isFinite(props.weightKg) || props.weightKg < 20 || props.weightKg > 400) {
      throw Object.assign(new Error("WEIGHT_OUT_OF_RANGE"), { code: "WEIGHT_OUT_OF_RANGE" });
    }
    if (
      props.bodyFat != null &&
      (!Number.isFinite(props.bodyFat) || props.bodyFat < 0 || props.bodyFat > 60)
    ) {
      throw Object.assign(new Error("BODYFAT_OUT_OF_RANGE"), { code: "BODYFAT_OUT_OF_RANGE" });
    }
    const createdAt = props.createdAt ?? new Date().toISOString();
    const weightKg = Math.round(props.weightKg * 10) / 10; // 1 decimal

    return new WeightLog(
      props.id,
      props.userId,
      props.dateISO,
      weightKg,
      createdAt,
      props.bodyFat
    );
  }
}
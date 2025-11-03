export type EntryCreateProps = {
  id: string;
  userId: string;
  foodId: string;
  grams: number;
  dateISO: string;     // YYYY-MM-DD o ISO completo
  createdAt?: string;  // opcional, el dominio pondrá ISO “now” si no viene
};

export class Entry {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly foodId: string,
    public readonly grams: number,
    public readonly dateISO: string,
    public readonly createdAt: string
  ) {}

  static create(params: {
    id: string;
    userId: string;
    foodId: string;
    grams: number;
    dateISO: string;        // YYYY-MM-DD o ISO completo
    createdAt?: string;
  }) {
    if (!params.userId || !params.foodId) {
      throw Object.assign(new Error("ENTRY_INVALID_IDS"), { code: "ENTRY_INVALID_IDS" });
    }
    if (!Number.isFinite(params.grams) || params.grams <= 0) {
      throw Object.assign(new Error("GRAMS_INVALID"), { code: "GRAMS_INVALID" });
    }
    if (typeof params.dateISO !== "string" || params.dateISO.length < 10) {
      throw Object.assign(new Error("DATE_INVALID"), { code: "DATE_INVALID" });
    }
    const createdAt = params.createdAt ?? new Date().toISOString();
    const grams = Math.round(params.grams * 100) / 100;

    return new Entry(
      params.id,
      params.userId,
      params.foodId,
      grams,
      params.dateISO,
      createdAt
    );
  }

  withGrams(grams: number) {
    if (!Number.isFinite(grams) || grams <= 0) {
      throw Object.assign(new Error("GRAMS_INVALID"), { code: "GRAMS_INVALID" });
    }
    return new Entry(this.id, this.userId, this.foodId, grams, this.dateISO, this.createdAt);
  }
}
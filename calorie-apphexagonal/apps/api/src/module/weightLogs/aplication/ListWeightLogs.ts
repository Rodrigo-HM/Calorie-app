export class ListWeightLogs {
  constructor(
    private readonly repo: {
      listByUser: (
        userId: string,
        range?: { from?: string; to?: string }
      ) => Promise<any[]>;
    }
  ) {}

  async run(userId: string, range?: { from?: string; to?: string }) {
    if (range?.from && range?.to && range.from > range.to) {
      const err: any = new Error("RANGE_INVALID");
      err.code = "RANGE_INVALID";
      throw err;
    }
    return this.repo.listByUser(userId, range);
  }
}

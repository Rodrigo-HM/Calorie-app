import { UpdateProfile } from "src/module/profile/application/UpdateProfile";

function makeProfileRepo(initial: any | null = null) {
  let store = initial;

  return {
    async get(userId: string) {
      return store && store.userId === userId ? store : null;
    },
    async update(userId: string, patch: any) {
      store = { ...(store ?? { userId }), ...patch, userId };
      return store;
    },
    __peek: () => store,
  };
}

describe("UpdateProfile", () => {
  it("persiste el patch sin pisar userId", async () => {
    const repo = makeProfileRepo({ userId: "u1", name: "Rodrigo" });
    const uc = new UpdateProfile(repo as any);

    const out = await uc.run("u1", { name: "RHM", age: 30 });

    expect(out.userId).toBe("u1");
    expect(out.name).toBe("RHM");
    expect(out.age).toBe(30);
  });
});

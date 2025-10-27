import type { TokenService } from "../../src/module/shared/infrastructure/token/token.types";

export const fakeTokenService: TokenService = {
  async sign(payload: any, _opts?: any) {
    return `token:${payload.sub ?? payload.id ?? "unknown"}`;
  },
};

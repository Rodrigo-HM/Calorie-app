import type { TokenService } from "../../src/module/auth/application/ports/security";

export function makeTokenService(): TokenService {
  return {
    sign(payload: Record<string, unknown>): string {
      // Fake simple y determinista para tests
      return `fake.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
    },
    verify<T = any>(_token: string): T {
      // Para unit de AuthService no verificamos nada; devolver dummy
      return {} as T;
    },
  };
}
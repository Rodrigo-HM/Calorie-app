export interface TokenService {
sign(payload: object, options?: any): Promise<string>;
}

export interface TokenVerifier {
verify<T = any>(token: string): T; // puede lanzar si es inválido
}
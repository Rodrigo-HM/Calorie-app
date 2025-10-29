import { ZodTypeAny, ZodError } from "zod";

export function parse<T extends ZodTypeAny>(schema: T, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Lanza ZodError para que tu middleware de errores devuelva 400
    throw result.error as ZodError;
  }

  return result.data as ReturnType<T["parse"]>;
}

import { z } from "zod";

export const AuthSchema = z.object({
email: z.string().email(),
password: z.string().min(6),
});

export type AuthDTO = z.infer<typeof AuthSchema>;

//si queremos agregar mas campos en el futuro, los agregamos aqui y en el schema, para validar 
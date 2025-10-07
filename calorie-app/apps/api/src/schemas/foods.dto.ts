import { z } from "zod";
export const FoodsQuerySchema = z.object({
search: z.string().trim().max(100).optional(),
page: z.coerce.number().int().min(1).optional().default(1),
pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type FoodsQueryDTO = z.infer<typeof FoodsQuerySchema>;

export const FoodIdParamsSchema = z.object({
id: z.string().min(1),
});

export type FoodIdParamsDTO = z.infer<typeof FoodIdParamsSchema>;
import { z } from "zod";

export const infoResponseSchema = z.object({
  status: z.literal("OK"),
});

export type InfoResponse = z.infer<typeof infoResponseSchema>;

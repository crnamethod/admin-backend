import { z } from "zod";

export type UserProfileBodyDto = z.infer<typeof UserProfileBodySchema>;

export const UserProfileBodySchema = z.object({
  id: z.string(),
});

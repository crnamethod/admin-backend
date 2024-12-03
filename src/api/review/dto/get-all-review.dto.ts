import { z } from "zod";

export const FindAllReviewSchema = z.object({
  limit: z.coerce.number().optional(),
  startingToken: z
    .any()
    .transform((val) => JSON.parse(val))
    .optional(),
});

export type FindAllReviewDto = z.infer<typeof FindAllReviewSchema>;

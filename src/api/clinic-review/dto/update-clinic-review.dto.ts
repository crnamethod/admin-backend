import type { z } from "zod";

import { ClinicReviewSchema } from "../clinic-review.model";

export type UpdateClinicReviewDto = z.infer<typeof UpdateClinicReviewSchema>;
export const UpdateClinicReviewSchema = ClinicReviewSchema.omit({ clinicId: true, likes: true })
  .partial()
  .extend({
    userId: ClinicReviewSchema.shape.userId,
  })
  .strict();

import type { z } from "zod";

import { ClinicReviewSchema } from "../clinic-review.model";
import { CreateClinicReviewSchema } from "./create-clinic-review.dto";

export type UpdateClinicReviewDto = z.infer<typeof UpdateClinicReviewSchema>;
export const UpdateClinicReviewSchema = CreateClinicReviewSchema.omit({ clinicId: true })
  .partial()
  .extend({
    userId: ClinicReviewSchema.shape.userId,
    // polls: z.array(UpdatePollSchema.omit({ question: true })).optional(),
  })
  .strict();

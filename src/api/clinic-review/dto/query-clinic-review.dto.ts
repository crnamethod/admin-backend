import type { z } from "zod";

import { ClinicReviewSchema } from "../clinic-review.model";

export type QueryClinicReviewDto = z.infer<typeof QueryClinicReviewSchema>;
export const QueryClinicReviewSchema = ClinicReviewSchema.pick({ reviewId: true, userId: true }).partial().extend({
  clinicId: ClinicReviewSchema.shape.clinicId,
});

export type QueryOneClinicReviewDto = z.infer<typeof QueryOneClinicReviewSchema>;
export const QueryOneClinicReviewSchema = ClinicReviewSchema.pick({ userId: true });

import type { z } from "zod";

import { ClinicReviewSchema } from "../clinic-review.model";

export type UpdateClinicReviewDto = z.infer<typeof UpdateClinicReviewSchema>;
export const UpdateClinicReviewSchema = ClinicReviewSchema.omit({ reviewId: true, clinicId: true, userId: true, likes: true, email: true }).partial().strict();

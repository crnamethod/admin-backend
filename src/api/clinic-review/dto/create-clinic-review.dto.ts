import type { z } from "zod";

import { ClinicReviewSchema } from "../clinic-review.model";

export const CreateClinicReviewSchema = ClinicReviewSchema.omit({ reviewId: true, likes: true, createdAt: true, updatedAt: true });

export type CreateClinicReviewDto = z.infer<typeof CreateClinicReviewSchema>;

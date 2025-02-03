import type { z } from "zod";

import { ReviewSchema } from "../reviewModel";

export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>;
export const UpdateReviewSchema = ReviewSchema.omit({ reviewId: true, schoolId: true, userId: true, likes: true }).partial().strict();

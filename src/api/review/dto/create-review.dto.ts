import type { z } from "zod";

import { ReviewSchema } from "../reviewModel";

export const CreateReviewSchema = ReviewSchema.omit({ reviewId: true, createdAt: true, updatedAt: true });
export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;

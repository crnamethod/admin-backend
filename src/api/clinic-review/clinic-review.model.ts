import { z } from "zod";

export type ClinicReviewType = z.infer<typeof ClinicReviewSchema>;
export const ClinicReviewSchema = z.object({
  reviewId: z.string().uuid(), // primary key
  userId: z.string(), // User who submitted the review
  clinicId: z.string(), // clinic being reviewed
  rating: z.number().min(1).max(5),
  comment: z.coerce.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  likes: z.number().int().default(0),
});

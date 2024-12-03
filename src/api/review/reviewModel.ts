import { z } from "zod";

import { ConnectedToEnum } from "@/common/enum/connectedTo.enum";

export type ReviewDto = z.infer<typeof ReviewSchema>;

export const ReviewSchema = z.object({
  reviewId: z.string().uuid(), // Unique identifier for each review
  userId: z.string(), // User who submitted the review
  schoolId: z.string(), // School being reviewed
  rating: z.number().min(1).max(5),
  connectedTo: z.nativeEnum(ConnectedToEnum), // Connection to school
  strengths: z.string().optional(),
  downsides: z.string().optional(),
  advice: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  likes: z.number().int().default(0),
});

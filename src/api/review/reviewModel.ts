import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Review = z.infer<typeof ReviewSchema>;
export const ReviewSchema = z.object({
  reviewId: z.string().uuid(), // Unique identifier for each review
  userId: z.string(), // User who submitted the review
  schoolId: z.string(), // School being reviewed
  rating: z.number().min(1).max(5),
  connectedTo: z.enum(["RRNA1", "RRNA2", "RRNA3", "CRNA"]), // Connection to school
  strengths: z.string().optional(),
  downsides: z.string().optional(),
  advice: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  likes: z.number().int().default(0),
});

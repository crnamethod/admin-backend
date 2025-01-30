import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { nowISO } from "@/common/utils/date";

extendZodWithOpenApi(z);

export type UserProfile = z.infer<typeof UserProfileSchema>;
export const UserProfileSchema = z.object({
  email: z.string().email(),
  userId: z.string(),
  stripeCustomerId: z.string().nullable().optional().default(null),
  isSubscriber: z.boolean().optional().default(false),
  lastPaymentStatus: z.string().nullable().optional().default(null),
  username: z.string().nullable().optional().default(null),
  firstName: z.string().nullable().optional().default(null),
  lastName: z.string().nullable().optional().default(null),
  image_path: z.string().nullable().optional().default(null),
  createdAt: z.string().optional().default(nowISO()),
  updatedAt: z.string().optional().default(nowISO()),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  id: z.string().uuid(),
});

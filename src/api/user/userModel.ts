import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { nowISO } from "@/common/utils/date";

extendZodWithOpenApi(z);

export type UserProfile = z.infer<typeof UserProfileSchema>;
export const UserProfileSchema = z.object({
  email: z.string().email(),
  userId: z.string(),
  stripeCustomerId: z.string().optional(),
  isSubscriber: z.boolean().default(false).optional(),
  lastPaymentStatus: z.string().nullable().default(null).optional(),
  username: z.string().nullable().default(null).optional(),
  firstName: z.string().nullable().default(null).optional(),
  lastName: z.string().nullable().default(null).optional(),
  image_path: z.string().nullable().default(null).optional(),
  createdAt: z.string().optional().default(nowISO()),
  updatedAt: z.string().optional().default(nowISO()),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  id: z.string().uuid(),
});

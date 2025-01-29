import type { z } from "zod";
import { UserProfileSchema } from "../userModel";

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export const UpdateProfileSchema = UserProfileSchema.omit({
  isSubscriber: true,
  createdAt: true,
  updatedAt: true,
  stripeCustomerId: true,
  userId: true,
}).partial();

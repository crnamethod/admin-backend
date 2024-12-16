import type { z } from "zod";
import { CreateUserProfileSchema } from "./create-user.dto";

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export const UpdateProfileSchema = CreateUserProfileSchema.omit({ stripeCustomerId: true, userId: true }).partial();

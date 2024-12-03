import type { z } from "zod";
import { UserProfileSchema } from "../userModel";

export type CreateUserProfileDto = z.infer<typeof CreateUserProfileSchema>;
export const CreateUserProfileSchema = UserProfileSchema.omit({ isSubscriber: true, createdAt: true, updatedAt: true });

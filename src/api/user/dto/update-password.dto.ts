import { z } from "zod";

export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;
export const UpdatePasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email format." })
    .min(1, { message: "Email is required." })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .min(1, { message: "Password is required." }),
});

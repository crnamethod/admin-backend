import { z } from "zod";

export const UpdatePasswordSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email format." }).nonempty({ message: "Email is required." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .nonempty({ message: "Password is required." }),
  }),
});

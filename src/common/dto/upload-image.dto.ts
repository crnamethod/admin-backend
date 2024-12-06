import { z } from "zod";

export type UploadImageDto = z.infer<typeof UploadImageSchema>;
export const UploadImageSchema = z
  .object({
    name: z.string().refine((name) => /\.(jpg|jpeg|png)$/i.test(name), {
      message: "Invalid file extension. Only .jpg, .jpeg, .png are allowed.",
    }),
    mimetype: z.string().refine((type) => ["image/jpg", "image/jpeg", "image/png"].includes(type), {
      message: "Invalid file type. Only JPG and PNG are allowed.",
    }),
    size: z.number().max(5 * 1024 * 1024, {
      message: "File size exceeds the limit of 1MB.",
    }),
  })
  .optional();

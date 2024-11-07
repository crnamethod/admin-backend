import { z } from "zod";

export const GetSchoolSchema = z.object({
  params: z.object({ schoolId: z.string() }),
});

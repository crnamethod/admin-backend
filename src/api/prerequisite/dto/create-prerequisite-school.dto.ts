import { z } from "zod";

import { PrerequisiteSchoolSchema } from "../models/prerequisite-school.model";

export type CreatePrerequisiteSchoolDto = z.infer<typeof CreatePrerequisiteSchoolSchema>;
export const CreatePrerequisiteSchoolSchema = z
  .object({
    schoolId: z.string().min(1),
    prerequisites: z.array(PrerequisiteSchoolSchema.omit({ schoolId: true })),
  })
  .strict();

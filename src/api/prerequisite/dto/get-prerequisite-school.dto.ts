import { z } from "zod";

export type FindPrerequisiteSchoolDto = z.infer<typeof FindPrerequisiteSchoolSchema>;
export const FindPrerequisiteSchoolSchema = z.object({
  prerequisiteId: z.string().uuid(),
  schoolId: z.string(),
});

export type FindPrerequisiteBySchoolDto = z.infer<typeof FindPrerequisiteBySchoolSchema>;
export const FindPrerequisiteBySchoolSchema = FindPrerequisiteSchoolSchema.pick({ schoolId: true });

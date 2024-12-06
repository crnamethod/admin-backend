import { z } from "zod";

export type PrerequisiteSchoolDto = z.infer<typeof PrerequisiteSchoolSchema>;
export const PrerequisiteSchoolSchema = z.object({
  prerequisiteId: z.string().uuid(),
  schoolId: z.string(),
  name: z.string().min(1),
  label: z.string().min(1),
  notes: z.string().nullable().default(null),
  min_grade_required: z.string().nullable().default(null),
  recency: z.coerce.number().default(0),
  lab: z.coerce.boolean().default(false),
});

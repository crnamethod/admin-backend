import { z } from "zod";

import { SchoolSchema } from "../school.model";

export const AssignPrerequisiteSchema = SchoolSchema.pick({ id: true, prerequisiteIds: true }).extend({
  prerequisiteIds: z
    .array(z.string())
    .nonempty()
    .transform((prerequisiteIds) => new Set(prerequisiteIds)),
});

export type AssignPrerequisiteDto = z.infer<typeof AssignPrerequisiteSchema>;

import type { z } from "zod";

import { SchoolSchema } from "../school.model";

export type CreateSchoolDto = z.infer<typeof CreateSchoolSchema>;
export const CreateSchoolSchema = SchoolSchema.omit({
  createdAt: true,
  updatedAt: true,
  prerequisiteIds: true,
}).strict();

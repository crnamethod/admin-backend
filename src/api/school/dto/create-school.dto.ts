import type { z } from "zod";

import { SchoolSchema } from "../school.model";

export const BaseCreateSchoolSchema = SchoolSchema.omit({
  createdAt: true,
  updatedAt: true,
  prerequisiteIds: true,
}).strict();

export type CreateSchoolDto = z.infer<typeof CreateSchoolSchema>;
export const CreateSchoolSchema = BaseCreateSchoolSchema.transform((data) => {
  return {
    ...data,
    search: data.name.toLowerCase(),
  };
});

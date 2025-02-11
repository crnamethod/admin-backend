import type { z } from "zod";

import { SchoolSchema } from "../school.model";

export const BaseCreateSchoolSchema = SchoolSchema.omit({
  createdAt: true,
  updatedAt: true,
  prerequisiteIds: true,
}).strict();

export type CreateSchoolDto = z.infer<typeof CreateSchoolSchema>;
export const CreateSchoolSchema = BaseCreateSchoolSchema.transform((data) => {
  if (data.rank === null || data.rank === 0) {
    data.padded_rank = "999999";
  } else {
    data.padded_rank = data.rank.toString().padStart(6, "0");
  }

  return {
    ...data,
    search: data.name.toLowerCase(),
  };
});

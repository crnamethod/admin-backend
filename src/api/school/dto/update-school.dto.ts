import type { z } from "zod";

import { BaseCreateSchoolSchema } from "./create-school.dto";

export type UpdateSchoolDto = z.infer<typeof UpdateSchoolSchema>;
export const UpdateSchoolSchema = BaseCreateSchoolSchema.partial()
  .omit({ id: true, clinicIds: true, gsiPartitionKey: true })
  .strict()
  .transform((data) => {
    if (data.rank === null || data.rank === 0) {
      data.padded_rank = "999999";
    } else if (data.rank) {
      data.padded_rank = data.rank.toString().padStart(6, "0");
    }

    if (data.name) {
      data.search = data.name.toLowerCase();
    }

    return data;
  });

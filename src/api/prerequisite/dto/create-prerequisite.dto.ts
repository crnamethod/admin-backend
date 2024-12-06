import { snakeCase } from "lodash";
import type { z } from "zod";

import { PrerequisiteSchema } from "../models/prerequisite.model";

export type CreatePrerequisiteDto = z.infer<typeof CreatePrerequisiteSchema>;
export const CreatePrerequisiteSchema = PrerequisiteSchema.omit({
  prerequisiteId: true,
  createdAt: true,
  updatedAt: true,
})
  .strict()
  .transform((data) => {
    return {
      ...data,
      name: snakeCase(data.label?.toLowerCase()),
    };
  });

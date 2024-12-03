import type { z } from "zod";

import { PrerequisiteSchema } from "../prerequisite.model";

export type CreatePrerequisiteDto = z.infer<typeof CreatePrerequisiteSchema>;
export const CreatePrerequisiteSchema = PrerequisiteSchema.omit({
  prerequisiteId: true,
  createdAt: true,
  updatedAt: true,
}).strict();

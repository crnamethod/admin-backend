import { z } from "zod";

import { AssignPrerequisiteSchema } from "./assign-prerequisite.dto";

const RemovePreqSchema = z.object({
  prerequisiteId: z.string(),
  name: z.string(),
});

export type RemovePrerequisiteDto = z.infer<typeof RemovePrerequisiteSchema>;

export const RemovePrerequisiteSchema = z.object({
  id: z.string(),
  prerequisites: z.array(RemovePreqSchema),
});

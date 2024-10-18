import type { z } from "zod";

import { SchoolSchema } from "../schoolModel";

export const UpdateSchoolSchema = SchoolSchema.partial().extend({
  id: SchoolSchema.shape.id,
  name: SchoolSchema.shape.name,
});

export type UpdateSchoolDto = z.infer<typeof UpdateSchoolSchema>;

import type { z } from "zod";

import { CreateSchoolSchema } from "./create-school.dto";

export type UpdateSchoolDto = z.infer<typeof UpdateSchoolSchema>;
export const UpdateSchoolSchema = CreateSchoolSchema.partial().omit({ id: true, clinicIds: true, gsiPartitionKey: true }).strict();

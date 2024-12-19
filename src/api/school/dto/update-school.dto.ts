import type { z } from "zod";

import { BaseCreateSchoolSchema } from "./create-school.dto";

export type UpdateSchoolDto = z.infer<typeof UpdateSchoolSchema>;
export const UpdateSchoolSchema = BaseCreateSchoolSchema.partial().omit({ id: true, clinicIds: true, gsiPartitionKey: true }).strict();

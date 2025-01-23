import { z } from "zod";

import { nowISO } from "@/common/utils/date";

export type SchoolClinicDto = z.infer<typeof SchoolClinicSchema>;
export const SchoolClinicSchema = z.object({
  schoolId: z.string(),
  clinicId: z.string().uuid(),
  createdAt: z.string().optional().default(nowISO()),
  updatedAt: z.string().optional().default(nowISO()),
});

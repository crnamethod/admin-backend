import { z } from "zod";

import { FetchEnum } from "@/api/school/dto/filter-school.dto";

export const FindAllClinicSchema = z.object({
  fetch: z.nativeEnum(FetchEnum).default(FetchEnum.NO_TRASH).optional(),
  limit: z.coerce.number().optional(),
  startingToken: z
    .any()
    .transform((val) => JSON.parse(val))
    .optional(),
  search: z
    .string()
    .transform((val) => val.toLowerCase())
    .optional(),
  sort: z.enum(["asc", "desc"]).optional(),
});

export type FindAllClinicDto = z.infer<typeof FindAllClinicSchema>;

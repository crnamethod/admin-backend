import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { rangeObject, tranformBooleanObject, transformArrayObject } from "@/common/validators/common.validator";

extendZodWithOpenApi(z);

export type GetSchoolsQueryDto = z.infer<typeof GetSchoolsQuerySchema>;

export const GetSchoolsQuerySchema = z.object({
  search: z
    .string()
    .transform((val) => val.toLowerCase())
    .optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().optional(),
  startingToken: z
    .any()
    .transform((val) => JSON.parse(val))
    .optional(),
  degree_type: transformArrayObject
    .refine((arr: string[]) => arr.every((item: string) => ["DNP", "DNAP"].includes(item)), {
      message: "value is Invalid",
    })
    .optional(),
  program_structure: transformArrayObject
    .refine((arr: string[]) => arr.every((item: string) => ["INTEGRATED", "HYBRID", "FRONT LOADED"].includes(item)), {
      message: "value is Invalid",
    })
    .optional(),
  prerequisites: transformArrayObject.optional(),
  application_deadline: transformArrayObject.optional(),
  minimum_icu_experience: rangeObject.optional(),
  specialty_experience: transformArrayObject
    .refine((arr: string[]) => arr.every((item: string) => ["NICU", "PICU", "ER", "ADULT_ICU"].includes(item)), {
      message: "value must be in the following: NICU, PICU, ER, ADULT_ICU",
    })
    .optional(),
  minimum_gpa: rangeObject.optional(),
  in_state_tuition: rangeObject.optional(),
  out_state_tuition: rangeObject.optional(),
  not_required: transformArrayObject
    .refine(
      (arr: string[]) => arr.every((item: string) => ["GRE", "SHADOW_EXPERIENCE", "CCRN", "BSN"].includes(item)),
      {
        message: "value must be in the following: GRE, SHADOW_EXPERIENCE, CCRN, BSN",
      },
    )
    .optional(),
  nursing_cas: tranformBooleanObject.optional(),
  new_program: tranformBooleanObject.optional(),
  acceptance_rate: rangeObject.optional(),
  other: transformArrayObject
    .refine(
      (arr: string[]) => arr.every((item: string) => ["FULLY_ONLINE_SEMESTERS", "LAST_60_UNITS"].includes(item)),
      {
        message: "value must be in the following: FULLY_ONLINE_SEMESTERS, LAST_60_UNITS",
      },
    )
    .optional(),
  minimum_science_gpa: rangeObject.optional(),
  class_size_category: z.enum(["small", "medium", "large"]).optional(),
  facilities: transformArrayObject
    .refine(
      (arr: string[]) =>
        arr.every((item: string) => ["CADAVER_LAB", "CRNA_ONLY_SITES", "SIMULATION_LAB"].includes(item)),
      {
        message: "value must be in the following: CADAVER_LAB, CRNA_ONLY_SITES, SIMULATION_LAB",
      },
    )
    .optional(),
  state: transformArrayObject.optional(),
});

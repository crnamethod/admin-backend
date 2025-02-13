import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { rangeObject, tranformBooleanObject, transformArrayObject } from "@/common/validators/common.validator";

import { ClimateEnum } from "../enum/school.enum";

extendZodWithOpenApi(z);

export type GetSchoolsQueryDto = z.infer<typeof GetSchoolsQuerySchema>;

export enum FetchEnum {
  NO_TRASH = "NO_TRASH",
  WITH_TRASH = "WITH_TRASH",
  TRASH_ONLY = "TRASH_ONLY",
}

export const GetSchoolsQuerySchema = z
  .object({
    fetch: z.nativeEnum(FetchEnum).default(FetchEnum.NO_TRASH).optional(),
    search: z
      .string()
      .transform((val) => val.toLowerCase())
      .optional(),
    sort_by_name: z.enum(["asc", "desc"]).optional(),
    sort_by_rank: z.enum(["asc", "desc"]).optional(),
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
      .refine((arr: string[]) => arr.every((item: string) => ["GRE", "SHADOW_EXPERIENCE", "CCRN", "BSN"].includes(item)), {
        message: "value must be in the following: GRE, SHADOW_EXPERIENCE, CCRN, BSN",
      })
      .optional(),
    nursing_cas: tranformBooleanObject.optional(),
    new_program: tranformBooleanObject.optional(),
    acceptance_rate: rangeObject.optional(),
    other: transformArrayObject
      .refine((arr: string[]) => arr.every((item: string) => ["FULLY_ONLINE_SEMESTERS", "LAST_60_UNITS"].includes(item)), {
        message: "value must be in the following: FULLY_ONLINE_SEMESTERS, LAST_60_UNITS",
      })
      .optional(),
    minimum_science_gpa: rangeObject.optional(),
    class_size_category: z.enum(["small", "medium", "large"]).optional(),
    facilities: transformArrayObject
      .refine((arr: string[]) => arr.every((item: string) => ["CADAVER_LAB", "CRNA_ONLY_SITES", "SIMULATION_LAB", "HIGH_FIDELITY_SIM"].includes(item)), {
        message: "value must be in the following: CADAVER_LAB, CRNA_ONLY_SITES, SIMULATION_LAB, HIGH_FIDELITY_SIM",
      })
      .optional(),
    state: transformArrayObject.optional(),
    location_type: transformArrayObject
      .refine((arr: string[]) => arr.every((item: string) => ["Metro", "Urban", "Suburban", "Rural"].includes(item)), {
        message: "value must be in the following: Metro, Urban, Suburban, Rural",
      })
      .optional(),
    climate: z.nativeEnum(ClimateEnum).optional(),
    cost_of_living: transformArrayObject
      .refine((arr: string[]) => arr.every((item: string) => ["low", "moderate", "high"].includes(item)), {
        message: "value must be in the following: low, moderate, high",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sort_by_name && data.sort_by_rank) {
      ctx.addIssue({
        code: "custom",
        message: "Only one sorting option can be provided.",
      });
    }
  });

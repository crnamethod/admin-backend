import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { ConnectedToEnum } from "@/common/enum/connectedTo.enum";
import { StatusReviewEnum } from "@/common/enum/review.enum";
import { nowISO } from "@/common/utils/date";

extendZodWithOpenApi(z);

export type ClinicalRotationsDto = z.infer<typeof ClinicalRotationsSchema>;
export const ClinicalRotationsSchema = z.object({
  dedicated_rotation: z.coerce.boolean().nullable().default(null),
  independent_practice: z.coerce.boolean().nullable().default(null),
  case_number: z.coerce.number().min(1).max(5).nullable().default(null),
});

const ClinicalRotation = z
  .object({
    dedicated_rotation: z.coerce.boolean().nullable().default(null),
    independent_practice: z.coerce.boolean().nullable().default(null),
    case_number: z.coerce.number().min(1).max(5).nullable().default(null),
  })
  .optional()
  .default({
    dedicated_rotation: null,
    independent_practice: null,
    case_number: null,
  });

export type ReviewDto = z.infer<typeof ReviewSchema>;
export const ReviewSchema = z.object({
  reviewId: z.string().uuid(), // Primary Key
  schoolId: z.string(),
  userId: z.string(),

  gsiPartitionKey: z.string().default("ALL"),

  email: z.string().nullable().optional().default(null),

  status: z.nativeEnum(StatusReviewEnum).optional().default(StatusReviewEnum.PENDING),
  rating: z.coerce.number().min(1).max(5),
  likes: z.number().int().default(0),

  affiliated_with: z.nativeEnum(ConnectedToEnum),
  is_recommended: z.coerce.boolean().nullable().optional().default(null),
  didactic_portion: z.coerce.boolean().nullable().optional().default(null),
  clinical_portion: z.coerce.boolean().nullable().optional().default(null),
  best_things: z.string().nullable().optional().default(null),
  best_things_search: z.string().nullable().optional().default(null),
  downsides: z.string().nullable().optional().default(null),
  downsides_search: z.string().nullable().optional().default(null),

  regional_blocks: ClinicalRotation,
  cardiac: ClinicalRotation,
  obstetrics: ClinicalRotation,
  pediatrics: ClinicalRotation,
  neurosurgery: ClinicalRotation,
  thoracic: ClinicalRotation,
  trauma: ClinicalRotation,

  spinals: z.coerce.number().min(1).max(5).nullable().default(null),
  epidurals: z.coerce.number().min(1).max(5).nullable().default(null),
  nerve_blocks: z.coerce.number().min(1).max(5).nullable().default(null),
  central_lines: z.coerce.number().min(1).max(5).nullable().default(null),
  pocus: z.coerce.number().min(1).max(5).nullable().default(null),
  tee: z.coerce.number().min(1).max(5).nullable().default(null),

  autonomy: z.coerce.number().min(1).max(10).nullable().default(null),
  teaching: z.coerce.number().min(1).max(10).nullable().default(null),
  simulation: z.coerce.number().min(1).max(10).nullable().default(null),
  support: z.coerce.number().min(1).max(10).nullable().default(null),
  wellness: z.coerce.number().min(1).max(10).nullable().default(null),

  createdAt: z.string().optional().default(nowISO()),
  updatedAt: z.string().optional().default(nowISO()),
  deletedAt: z.string().nullable().optional().default(null),
});

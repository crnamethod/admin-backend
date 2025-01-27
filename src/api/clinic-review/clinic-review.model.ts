import { z } from "zod";

import { StatusReviewEnum } from "@/common/enum/review.enum";
import { nowISO } from "@/common/utils/date";

import {
  ExperienceEnum,
  OtherEnum,
  OtherLearnerEnum,
  PracticeModelEnum,
  PracticeSettingEnum,
  ScheduleEnum,
  SubSpecialtiesEnum,
  YearOfTrainingEnum,
} from "./enums/clinic-review.enum";

export type ClinicReviewType = z.infer<typeof ClinicReviewSchema>;
export const ClinicReviewSchema = z.object({
  reviewId: z.string().uuid(), // Unique identifier for each review
  userId: z.string(), // User who submitted the review
  clinicId: z.string().uuid(), // clinic being reviewed

  gsiPartitionKey: z.string().default("ALL"),

  status: z.nativeEnum(StatusReviewEnum).optional().default(StatusReviewEnum.PENDING),
  likes: z.coerce.number().int().default(0),
  rating: z.coerce.number().min(1).max(5),

  feedback: z.string().nullable().optional().default(null),
  feedback_search: z.string().nullable().optional().default(null),
  year_of_training: z.nativeEnum(YearOfTrainingEnum),

  practice_model: z.array(z.nativeEnum(PracticeModelEnum)).optional().default([]),
  practice_setting: z.array(z.nativeEnum(PracticeSettingEnum)).optional().default([]),
  other_learners: z.array(z.nativeEnum(OtherLearnerEnum)).optional().default([]),
  experience: z.array(z.nativeEnum(ExperienceEnum)).optional().default([]),
  sub_specialties: z.array(z.nativeEnum(SubSpecialtiesEnum)).optional().default([]),
  other: z.array(z.nativeEnum(OtherEnum)).optional().default([]),
  schedule: z.array(z.nativeEnum(ScheduleEnum)).optional().default([]),

  autonomy: z.coerce.number().min(1).max(10).nullable().optional().default(null),
  supervision: z.coerce.number().min(1).max(10).nullable().optional().default(null),
  support: z.coerce.number().min(1).max(10).nullable().optional().default(null),
  teaching: z.coerce.number().min(1).max(10).nullable().optional().default(null),
  preparation: z.coerce.number().min(1).max(10).nullable().optional().default(null),

  createdAt: z.string().default(nowISO()).optional(),
  updatedAt: z.string().default(nowISO()).optional(),
  deletedAt: z.string().nullable().optional().default(null),
});

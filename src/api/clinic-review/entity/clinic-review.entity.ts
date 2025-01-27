import type {
  ExperienceEnum,
  OtherEnum,
  OtherLearnerEnum,
  PracticeModelEnum,
  PracticeSettingEnum,
  ScheduleEnum,
  SubSpecialtiesEnum,
  YearOfTrainingEnum,
} from "@/api/clinic-review/enums/clinic-review.enum";
import type { StatusReviewEnum } from "@/common/enum/review.enum";
import type { EntityOptions } from "@/common/types/entity.type";
import { nowISO } from "@/common/utils/date";
import { generateUUID } from "@/common/utils/idGenerator";

import type { ClinicReviewType } from "../clinic-review.model";

export class ClinicReviewEntity implements ClinicReviewType {
  constructor(data: Partial<ClinicReviewEntity>, options?: EntityOptions) {
    const { existing = true } = options || {};

    Object.assign(this, data);

    if (!data.reviewId && !existing) {
      this.reviewId = generateUUID();
    }

    if (!data.createdAt && !existing) {
      this.createdAt = nowISO();
    }

    if (!data.updatedAt && !existing) {
      this.updatedAt = nowISO();
    }
  }

  reviewId!: string;
  clinicId!: string;
  userId!: string;

  gsiPartitionKey!: string;

  status!: StatusReviewEnum;
  rating!: number;
  likes!: number;

  year_of_training!: YearOfTrainingEnum;
  feedback!: string | null;
  feedback_search!: string | null;

  practice_model!: PracticeModelEnum[];
  practice_setting!: PracticeSettingEnum[];
  other_learners!: OtherLearnerEnum[];
  experience!: ExperienceEnum[];
  sub_specialties!: SubSpecialtiesEnum[];
  other!: OtherEnum[];
  schedule!: ScheduleEnum[];

  autonomy!: number | null;
  supervision!: number | null;
  support!: number | null;
  teaching!: number | null;
  preparation!: number | null;

  createdAt!: string;
  updatedAt!: string;
  deletedAt!: string | null;
}

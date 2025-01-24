import type { ConnectedToEnum } from "@/common/enum/connectedTo.enum";
import type { StatusReviewEnum } from "@/common/enum/review.enum";
import type { EntityOptions } from "@/common/types/entity.type";
import { nowISO } from "@/common/utils/date";
import { generateUUID } from "@/common/utils/idGenerator";

import type { ClinicalRotationsDto, ReviewDto } from "../reviewModel";

export class ReviewEntity implements ReviewDto {
  constructor(data: Partial<ReviewEntity>, options?: EntityOptions) {
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

  schoolId!: string;
  reviewId!: string;
  userId!: string;

  gsiPartitionKey!: string;

  status!: StatusReviewEnum;
  rating!: number;
  likes!: number;

  affiliated_with!: ConnectedToEnum;
  is_recommended!: boolean | null;
  didactic_portion!: boolean | null;
  clinical_portion!: boolean | null;
  best_things!: string | null;
  downsides!: string | null;

  regional_blocks!: ClinicalRotationEntity;
  cardiac!: ClinicalRotationEntity;
  obstetrics!: ClinicalRotationEntity;
  pediatrics!: ClinicalRotationEntity;
  neurosurgery!: ClinicalRotationEntity;
  thoracic!: ClinicalRotationEntity;
  trauma!: ClinicalRotationEntity;

  spinals!: number | null;
  epidurals!: number | null;
  nerve_blocks!: number | null;
  central_lines!: number | null;
  pocus!: number | null;
  tee!: number | null;

  autonomy!: number | null;
  teaching!: number | null;
  simulation!: number | null;
  support!: number | null;
  wellness!: number | null;

  createdAt!: string;
  updatedAt!: string;
  deletedAt!: string | null;
}

class ClinicalRotationEntity implements ClinicalRotationsDto {
  constructor(data: ClinicalRotationEntity) {
    Object.assign(this, data);
  }

  dedicated_rotation!: boolean | null;
  independent_practice!: boolean | null;
  case_number!: number | null;
}

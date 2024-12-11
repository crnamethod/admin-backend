import { nowISO } from "@/common/utils/date";
import { generateUUID } from "@/common/utils/idGenerator";

import type { ClinicReviewType } from "../clinic-review.model";

export class ClinicReviewEntity implements ClinicReviewType {
  constructor(data: Partial<ClinicReviewEntity>, existing = true) {
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
  rating!: number;
  comment!: string;
  likes = 0;
  createdAt!: string;
  updatedAt!: string;

  // polls?: PollEntity[];
}

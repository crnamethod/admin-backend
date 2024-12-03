import type { ConnectedToEnum } from "@/common/enum/connectedTo.enum";

import type { ReviewDto } from "../reviewModel";

export class ReviewEntity implements ReviewDto {
  constructor(data: Partial<ReviewEntity>) {
    Object.assign(this, data);
  }

  reviewId!: string;
  createdAt!: string;
  updatedAt!: string;
  userId!: string;
  schoolId!: string;
  connectedTo!: ConnectedToEnum;
  likes!: number;
  rating!: number;
  strengths!: string;
  downsides!: string;
  advice!: string;
}

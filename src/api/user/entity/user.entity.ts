import type { EntityOptions } from "@/common/types/entity.type";
import { nowISO } from "@/common/utils/date";
import type { UserProfile } from "../userModel";

export class UserEntity implements UserProfile {
  constructor(data?: Partial<UserEntity>, options?: EntityOptions) {
    const { existing = true } = options || {};

    Object.assign(this, data);

    if (!data?.createdAt && !existing) {
      this.createdAt = nowISO();
    }

    if (!data?.updatedAt && !existing) {
      this.updatedAt = nowISO();
    }
  }

  userId!: string;
  email!: string;
  isSubscriber!: boolean;
  stripeCustomerId!: string | null;
  firstName!: string | null;
  lastName!: string | null;
  image_path!: string | null;
  lastPaymentStatus!: string | null;
  username!: string | null;
  createdAt!: string;
  updatedAt!: string;
}

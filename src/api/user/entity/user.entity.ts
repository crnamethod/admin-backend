import type { UserProfile } from "../userModel";

export class UserEntity implements UserProfile {
  constructor(data?: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  userId!: string;
  email!: string;
  isSubscriber!: boolean;
  stripeCustomerId!: string;
  firstName!: string;
  lastName!: string;
  lastPaymentStatus!: string;
  username!: string;
  createdAt!: string;
  updatedAt!: string;
}

import type { EntityOptions } from "@/common/types/entity.type";
import { nowISO } from "@/common/utils/date";
import { generateUUID } from "@/common/utils/idGenerator";

import type { PrerequisiteDto } from "../models/prerequisite.model";

export class PrerequisiteEntity implements PrerequisiteDto {
  constructor(data: Partial<PrerequisiteEntity>, options?: EntityOptions) {
    const { existing = true } = options || {};

    Object.assign(this, data);

    if (!data.prerequisiteId && !existing) {
      this.prerequisiteId = generateUUID();
    }

    if (!data.createdAt && !existing) {
      this.createdAt = nowISO();
    }

    if (!data.updatedAt && !existing) {
      this.updatedAt = nowISO();
    }
  }

  prerequisiteId!: string;
  label!: string;
  name!: string;
  createdAt!: string;
  updatedAt!: string;
}

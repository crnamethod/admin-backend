import type { EntityOptions } from "@/common/types/entity.type";
import { nowISO } from "@/common/utils/date";

import type { SchoolClinicDto } from "./school-clinic.model";

export class SchoolClinicEntity implements SchoolClinicDto {
  constructor(data: Partial<SchoolClinicEntity>, options?: EntityOptions) {
    const { existing = true } = options || {};

    Object.assign(this, data);

    if (!data?.createdAt && !existing) {
      this.createdAt = nowISO();
    }

    if (!data?.updatedAt && !existing) {
      this.updatedAt = nowISO();
    }
  }

  schoolId!: string;
  clinicId!: string;
  createdAt!: string;
  updatedAt!: string;
}

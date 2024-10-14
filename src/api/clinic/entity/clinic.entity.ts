import { nowISO } from '@/common/utils/date';
import { generateUUID } from '@/common/utils/idGenerator';

import { ClinicType } from '../clinicModel';

export class ClinicEntity implements ClinicType {
  constructor(data: Partial<ClinicEntity>, existing: boolean = true) {
    Object.assign(this, data);

    if (!data.clinicId && !existing) {
      this.clinicId = generateUUID();
    }

    if (!data.createdAt && !existing) {
      this.createdAt = nowISO();
    }

    if (!data.updatedAt && !existing) {
      this.updatedAt = nowISO();
    }
  }

  clinicId!: string;
  name!: string;
  address!: string;
  latitude!: number;
  longitude!: number;
  ratings!: number;
  createdAt!: string;
  updatedAt!: string;
}

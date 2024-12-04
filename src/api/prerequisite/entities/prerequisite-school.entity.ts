import type { PrerequisiteSchoolDto } from "../models/prerequisite-school.model";

export class PrerequisiteSchoolEntity implements PrerequisiteSchoolDto {
  constructor(data: Partial<PrerequisiteSchoolEntity>) {
    Object.assign(this, data);
  }

  schoolId!: string;
  prerequisiteId!: string;
  name!: string;
  label?: string;
  notes!: string | null;
  min_grade_required!: string | null;
  recency!: number;
  lab!: boolean;
}

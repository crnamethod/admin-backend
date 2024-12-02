import type { PrerequisiteSchoolDto } from "../prerequisite-school.model";

export class PrerequisiteSchoolEntity implements PrerequisiteSchoolDto {
  constructor(data: Partial<PrerequisiteSchoolEntity>) {
    Object.assign(this, data);
  }

  schoolId!: string;
  prerequisiteId!: string;
  name!: string;
  notes!: string;
  min_grade_required!: string;
  recency!: number;
  lab!: boolean;
}

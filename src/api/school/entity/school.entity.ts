// import { PrerequisiteSchoolEntity } from '@/api/prerequisite/entities/prerequisite-school.entity';
import type { EntityOptions } from "@/common/types/entity.type";
import { nowISO } from "@/common/utils/date";
import { env } from "@/common/utils/envConfig";

import type { PrerequisiteSchoolEntity } from "@/api/prerequisite/entities/prerequisite-school.entity";
import type { DegreeTypeEnum, ProgramStructureEnum, SchoolDto } from "../school.model";

export class SchoolEntity implements SchoolDto {
  constructor(data: Partial<SchoolEntity>, options?: EntityOptions) {
    const { existing = true } = options || {};

    Object.assign(this, data);

    if (!data?.createdAt && !existing) {
      this.createdAt = nowISO();
    }

    if (!data?.updatedAt && !existing) {
      this.updatedAt = nowISO();
    }

    if (data?.clinicIds) {
      this.clinicIds = Array.from(data.clinicIds);
    }

    if (data?.prerequisiteIds) {
      this.prerequisiteIds = Array.from(data.prerequisiteIds);
    }

    if (data?.pros) {
      this.pros = Array.from(data.pros);
    }

    if (data?.cons) {
      this.cons = Array.from(data.cons);
    }

    if (data?.image_url && !data?.image_url.includes("http")) {
      this.image_url = `https://${env.AWS_S3_BUCKET}.s3.amazonaws.com/school-images/${data.image_url}`;
    }

    if (data?.thumbnail_url && !data?.thumbnail_url.includes("http")) {
      this.thumbnail_url = `https://${env.AWS_S3_BUCKET}.s3.amazonaws.com/thumbnails/${data.thumbnail_url}`;
    }
  }

  id!: string;
  name!: string;
  title!: string | null;

  search!: string | null;
  gsiPartitionKey!: string;

  email!: string | null;
  program_director!: string | null;
  website_link!: string | null;
  new_program!: boolean;

  excerpt!: string | null;
  hide!: boolean;

  address!: string | null;
  latitude!: number;
  longitude!: number;

  phone!: string | null;

  state!: string | null;
  city!: string | null;

  interview!: string | null;
  decision_posted!: string | null;
  program_start_date!: string | null;

  rank!: number;
  ratings!: number;

  thumbnail_url!: string | null;
  image_url!: string | null;

  minimum_icu_experience!: number;
  minimum_icu_experience_notes!: string | null;
  nicu!: boolean;
  nicu_notes!: string | null;
  picu!: boolean;
  picu_notes!: string | null;
  er!: boolean;
  er_notes!: string | null;
  adult_icu!: boolean;
  adult_icu_notes!: string | null;

  // ? Admission Requirements
  bsn!: boolean;
  bsn_notes!: string | null;
  minimum_gpa!: number;
  minimum_gpa_notes!: string | null;
  minimum_science_gpa!: number;
  minimum_science_gpa_notes!: string | null;
  last_60_units!: boolean;
  last_60_units_notes!: string | null;
  gre!: boolean;
  gre_notes!: string | null;
  nursing_cas!: boolean;
  nursing_cas_notes!: string | null;
  experience_deadline!: string | null;
  experience_deadline_notes!: string | null;
  shadow_experience!: boolean;
  shadow_experience_notes!: string | null;
  ccrn!: boolean;
  ccrn_notes!: string | null;
  online_components!: boolean;
  online_components_notes!: string | null;

  degree_type!: DegreeTypeEnum | null;
  degree_type_notes!: string | null;

  year_established!: string | null;
  credit_hours!: number;
  duration_months!: number;
  fully_online_semesters!: boolean;
  fully_online_notes!: string | null;
  passing_grade_requirement!: string | null;

  program_structure!: ProgramStructureEnum | null;
  program_structure_notes!: string | null;

  application_deadline!: string[] | null;
  application_deadline_notes!: string | null;

  // ? Financial Information
  in_state_tuition!: number;
  in_state_tuition_notes!: string | null;
  out_state_tuition!: number;
  out_state_tuition_notes!: string | null;
  nursing_cas_fee!: number;
  application_fee!: number;
  total_application_fee!: number;
  see_cost_included!: boolean;
  nce_cost_included!: boolean;
  conference_fee_included!: boolean;
  board_prep_materials_included!: boolean;
  free_housing_for_distant_clinical_sites!: boolean;
  cost_of_living!: number;

  // ? Facilities
  simulation_lab!: boolean;
  simulation_lab_notes!: string | null;
  cadaver_lab!: boolean;
  cadaver_lab_notes!: string | null;
  crna_only_sites!: boolean;
  crna_only_sites_notes!: string | null;

  class_size!: string | null;
  class_size_category!: string | null;
  class_size_notes!: string | null;

  acceptance_rate!: number;
  attrition_rate!: number;
  board_passing_rate!: number;

  // ? Clinical
  number_of_clinical_sites!: string | null;
  primary_home_clinical_site!: boolean;
  out_of_state_clinical_site!: boolean;
  relocation_for_clinical_sites!: boolean;
  ability_to_create_own_clinical_rotations!: boolean;

  // ? Shifts & Schedules
  call_overnight_shifts_requirement!: boolean;
  weekend_shifts_requirement!: boolean;
  holiday_shift_requirement!: boolean;
  mission_trip_opportunities!: boolean;

  // ? Practice Models & Autonomy
  practice_models_at_clinical_sites!: string | null;
  opportunities_for_autonomy!: number;
  use_of_aas!: boolean;
  md_do_anesthesiology_residents_presence!: boolean;
  rrnas_from_other_programs!: boolean;
  impact_of_competing_learners!: boolean;
  academic_medical_center_clinical_sites!: boolean;
  rural_or_critical_access_clinical_sites!: boolean;
  office_anesthesia_sites!: boolean;
  crna_only_clinical_sites!: boolean;

  // ? Program Culture
  program_culture_vibe!: string | null;
  faculty_information!: string | null;
  program_culture_comments!: string | null;
  time_off_allowed_sick_days_policy!: string | null;
  flexibility_for_learning_disabilities!: string | null;
  support_for_underrepresented_minorities!: boolean;

  pros!: string[] | null;
  cons!: string[] | null;
  clinicIds!: string[] | null;
  prerequisiteIds!: string[] | null;

  createdAt!: string;
  updatedAt!: string;
  deletedAt!: string | null;

  prerequisites?: PrerequisiteSchoolEntity[];
}

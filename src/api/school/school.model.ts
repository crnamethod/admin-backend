import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { nowISO } from "@/common/utils/date";

extendZodWithOpenApi(z);

export enum DegreeTypeEnum {
  DNP = "DNP",
  DNAP = "DNAP",
}

export enum ProgramStructureEnum {
  INTEGRATED = "INTEGRATED",
  HYBRID = "HYBRID",
  FRONTLOADED = "FRONT LOADED",
}

export type SchoolDto = z.infer<typeof SchoolSchema>;

export const SchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().nullable().default(null),

  search: z.string().nullable().default(null),
  gsiPartitionKey: z.string().default("ALL"),

  email: z.string().nullable().default(null),
  program_director: z.string().nullable().default(null),
  website_link: z.string().nullable().default(null),
  new_program: z.string().nullable().default(null),

  excerpt: z.coerce.string().nullable().default(null),
  hide: z.coerce.boolean().nullable().default(false),

  address: z.coerce.string().nullable().default(null),
  latitude: z.coerce.number().default(0),
  longitude: z.coerce.number().default(0),

  phone: z.coerce.string().nullable().default(null),

  state: z.string().nullable().default(null),
  city: z.string().nullable().default(null),

  interview: z.coerce.string().nullable().default(null),
  decision_posted: z.coerce.string().nullable().default(null),
  program_start_date: z.coerce.string().nullable().default(null),

  rank: z.coerce.number().default(0),
  ratings: z.coerce.number().default(0),

  thumbnail_url: z.coerce.string().nullable().default(null),
  image_url: z.coerce.string().nullable().default(null),

  minimum_icu_experience: z.coerce.number().default(0),
  minimum_icu_experience_notes: z.coerce.string().nullable().default(null),
  nicu: z.string().nullable().default(null),
  nicu_notes: z.coerce.string().nullable().default(null),
  picu: z.string().nullable().default(null),
  picu_notes: z.coerce.string().nullable().default(null),
  er: z.string().nullable().default(null),
  er_notes: z.coerce.string().nullable().default(null),
  adult_icu: z.string().nullable().default(null),
  adult_icu_notes: z.coerce.string().nullable().default(null),

  // ? Admission Requirements
  bsn: z.string().nullable().default(null),
  bsn_notes: z.coerce.string().nullable().default(null),
  minimum_gpa: z.coerce.number().default(0),
  minimum_gpa_notes: z.coerce.string().nullable().default(null),
  minimum_science_gpa: z.coerce.number().default(0),
  minimum_science_gpa_notes: z.coerce.string().nullable().default(null),
  last_60_units: z.string().nullable().default(null),
  last_60_units_notes: z.coerce.string().nullable().default(null),
  gre: z.string().nullable().default(null),
  gre_notes: z.coerce.string().nullable().default(null),
  nursing_cas: z.string().nullable().default(null),
  nursing_cas_notes: z.coerce.string().nullable().default(null),
  experience_deadline: z.coerce.string().nullable().default(null),
  experience_deadline_notes: z.coerce.string().nullable().default(null),
  shadow_experience: z.string().nullable().default(null),
  shadow_experience_notes: z.coerce.string().nullable().default(null),
  ccrn: z.string().nullable().default(null),
  ccrn_notes: z.coerce.string().nullable().default(null),
  online_components: z.string().nullable().default(null),
  online_components_notes: z.coerce.string().nullable().default(null),

  degree_type: z.nativeEnum(DegreeTypeEnum).nullable().default(null),
  degree_type_notes: z.coerce.string().nullable().default(null),

  year_established: z.coerce.string().nullable().default(null),
  credit_hours: z.coerce.number().default(0),
  duration_months: z.coerce.number().default(0),
  fully_online_semesters: z.string().nullable().default(null),
  fully_online_notes: z.coerce.string().nullable().default(null),
  passing_grade_requirement: z.coerce.string().nullable().default(null),

  program_structure: z.nativeEnum(ProgramStructureEnum).nullable().default(null),
  program_structure_notes: z.coerce.string().nullable().default(null),

  application_open: z.coerce.string().nullable().default(null),
  application_open_notes: z.coerce.string().nullable().default(null),
  application_deadline: z.array(z.string()).nullable().default(null),
  application_deadline_notes: z.coerce.string().nullable().default(null),

  // ? Financial Information
  in_state_tuition: z.coerce.number().default(0),
  in_state_tuition_notes: z.coerce.string().nullable().default(null),
  out_state_tuition: z.coerce.number().default(0),
  out_state_tuition_notes: z.coerce.string().nullable().default(null),
  nursing_cas_fee: z.coerce.number().default(0),
  application_fee: z.coerce.number().default(0),
  total_application_fee: z.coerce.number().default(0),
  see_cost_included: z.string().nullable().default(null),
  nce_cost_included: z.string().nullable().default(null),
  conference_fee_included: z.string().nullable().default(null),
  board_prep_materials_included: z.string().nullable().default(null),
  free_housing_for_distant_clinical_sites: z.string().nullable().default(null),
  cost_of_living: z.coerce.number().default(0),

  // ? Facilities
  simulation_lab: z.string().nullable().default(null),
  simulation_lab_notes: z.coerce.string().nullable().default(null),
  cadaver_lab: z.string().nullable().default(null),
  cadaver_lab_notes: z.coerce.string().nullable().default(null),
  crna_only_sites: z.string().nullable().default(null),
  crna_only_sites_notes: z.coerce.string().nullable().default(null),

  class_size: z.coerce.string().nullable().default(null),
  class_size_category: z.coerce.string().nullable().default(null),
  class_size_notes: z.coerce.string().nullable().default(null),

  acceptance_rate: z.coerce.number().default(0),
  attrition_rate: z.coerce.number().default(0),
  board_passing_rate: z.coerce.number().default(0),

  // ? Clinical
  number_of_clinical_sites: z.coerce.string().nullable().default(null),
  primary_home_clinical_site: z.string().nullable().default(null),
  out_of_state_clinical_site: z.string().nullable().default(null),
  relocation_for_clinical_sites: z.string().nullable().default(null),
  ability_to_create_own_clinical_rotations: z.string().nullable().default(null),

  // ? Shifts & Schedules
  call_overnight_shifts_requirement: z.string().nullable().default(null),
  weekend_shifts_requirement: z.string().nullable().default(null),
  holiday_shift_requirement: z.string().nullable().default(null),
  mission_trip_opportunities: z.string().nullable().default(null),

  // ? Practice Models & Autonomy
  practice_models_at_clinical_sites: z.coerce.string().nullable().default(null),
  opportunities_for_autonomy: z.coerce.number().default(0),
  use_of_aas: z.string().nullable().default(null),
  md_do_anesthesiology_residents_presence: z.string().nullable().default(null),
  rrnas_from_other_programs: z.string().nullable().default(null),
  impact_of_competing_learners: z.string().nullable().default(null),
  academic_medical_center_clinical_sites: z.string().nullable().default(null),
  rural_or_critical_access_clinical_sites: z.string().nullable().default(null),
  office_anesthesia_sites: z.string().nullable().default(null),
  crna_only_clinical_sites: z.string().nullable().default(null),

  // ? Program Culture
  program_culture_vibe: z.coerce.string().nullable().default(null),
  faculty_information: z.coerce.string().nullable().default(null),
  program_culture_comments: z.coerce.string().nullable().default(null),
  time_off_allowed_sick_days_policy: z.coerce.string().nullable().default(null),
  flexibility_for_learning_disabilities: z.coerce.string().nullable().default(null),
  support_for_underrepresented_minorities: z.string().nullable().default(null),

  // ? To store it in School table
  // prerequisiteIds: z
  //   .array(z.string())
  //   .transform((id) => new Set(id))
  //   .nullable()
  //   .default(null),

  clinicIds: z.array(z.string()).nullable().default(null),
  prerequisiteIds: z.any().nullable().default(null),

  pros: z.array(z.string()).nullable().default(null),
  cons: z.array(z.string()).nullable().default(null),

  createdAt: z.string().default(nowISO()).optional(),
  updatedAt: z.string().default(nowISO()).optional(),
  deletedAt: z.string().nullable().default(null).optional(),
});

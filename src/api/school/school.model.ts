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
  new_program: z.coerce.boolean().nullable().default(false),

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
  nicu: z.coerce.boolean().nullable().default(false),
  nicu_notes: z.coerce.string().nullable().default(null),
  picu: z.coerce.boolean().nullable().default(false),
  picu_notes: z.coerce.string().nullable().default(null),
  er: z.coerce.boolean().nullable().default(false),
  er_notes: z.coerce.string().nullable().default(null),
  adult_icu: z.coerce.boolean().nullable().default(false),
  adult_icu_notes: z.coerce.string().nullable().default(null),

  // ? Admission Requirements
  bsn: z.coerce.boolean().nullable().default(false),
  bsn_notes: z.coerce.string().nullable().default(null),
  minimum_gpa: z.coerce.number().default(0),
  minimum_gpa_notes: z.coerce.string().nullable().default(null),
  minimum_science_gpa: z.coerce.number().default(0),
  minimum_science_gpa_notes: z.coerce.string().nullable().default(null),
  last_60_units: z.coerce.boolean().nullable().default(false),
  last_60_units_notes: z.coerce.string().nullable().default(null),
  gre: z.coerce.boolean().nullable().default(false),
  gre_notes: z.coerce.string().nullable().default(null),
  nursing_cas: z.coerce.boolean().nullable().default(false),
  nursing_cas_notes: z.coerce.string().nullable().default(null),
  experience_deadline: z.coerce.string().nullable().default(null),
  experience_deadline_notes: z.coerce.string().nullable().default(null),
  shadow_experience: z.coerce.boolean().nullable().default(false),
  shadow_experience_notes: z.coerce.string().nullable().default(null),
  ccrn: z.coerce.boolean().nullable().default(false),
  ccrn_notes: z.coerce.string().nullable().default(null),
  online_components: z.coerce.boolean().nullable().default(false),
  online_components_notes: z.coerce.string().nullable().default(null),

  degree_type: z.nativeEnum(DegreeTypeEnum).nullable().default(null),
  degree_type_notes: z.coerce.string().nullable().default(null),

  year_established: z.coerce.string().nullable().default(null),
  credit_hours: z.coerce.number().default(0),
  duration_months: z.coerce.number().default(0),
  fully_online_semesters: z.coerce.boolean().nullable().default(false),
  fully_online_notes: z.coerce.string().nullable().default(null),
  passing_grade_requirement: z.coerce.string().nullable().default(null),

  program_structure: z.nativeEnum(ProgramStructureEnum).nullable().default(null),
  program_structure_notes: z.coerce.string().nullable().default(null),

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
  see_cost_included: z.coerce.boolean().nullable().default(false),
  nce_cost_included: z.coerce.boolean().nullable().default(false),
  conference_fee_included: z.coerce.boolean().nullable().default(false),
  board_prep_materials_included: z.coerce.boolean().nullable().default(false),
  free_housing_for_distant_clinical_sites: z.coerce.boolean().nullable().default(false),
  cost_of_living: z.coerce.number().default(0),

  // ? Facilities
  simulation_lab: z.coerce.boolean().nullable().default(false),
  simulation_lab_notes: z.coerce.string().nullable().default(null),
  cadaver_lab: z.coerce.boolean().nullable().default(false),
  cadaver_lab_notes: z.coerce.string().nullable().default(null),
  crna_only_sites: z.coerce.boolean().nullable().default(false),
  crna_only_sites_notes: z.coerce.string().nullable().default(null),

  class_size: z.coerce.string().nullable().default(null),
  class_size_category: z.coerce.string().nullable().default(null),
  class_size_notes: z.coerce.string().nullable().default(null),

  acceptance_rate: z.coerce.number().default(0),
  attrition_rate: z.coerce.number().default(0),
  board_passing_rate: z.coerce.number().default(0),

  // ? Clinical
  number_of_clinical_sites: z.coerce.string().nullable().default(null),
  primary_home_clinical_site: z.coerce.boolean().nullable().default(false),
  out_of_state_clinical_site: z.coerce.boolean().nullable().default(false),
  relocation_for_clinical_sites: z.coerce.boolean().nullable().default(false),
  ability_to_create_own_clinical_rotations: z.coerce.boolean().nullable().default(false),

  // ? Shifts & Schedules
  call_overnight_shifts_requirement: z.coerce.boolean().nullable().default(false),
  weekend_shifts_requirement: z.coerce.boolean().nullable().default(false),
  holiday_shift_requirement: z.coerce.boolean().nullable().default(false),
  mission_trip_opportunities: z.coerce.boolean().nullable().default(false),

  // ? Practice Models & Autonomy
  practice_models_at_clinical_sites: z.coerce.string().nullable().default(null),
  opportunities_for_autonomy: z.coerce.number().default(0),
  use_of_aas: z.coerce.boolean().nullable().default(false),
  md_do_anesthesiology_residents_presence: z.coerce.boolean().nullable().default(false),
  rrnas_from_other_programs: z.coerce.boolean().nullable().default(false),
  impact_of_competing_learners: z.coerce.boolean().nullable().default(false),
  academic_medical_center_clinical_sites: z.coerce.boolean().nullable().default(false),
  rural_or_critical_access_clinical_sites: z.coerce.boolean().nullable().default(false),
  office_anesthesia_sites: z.coerce.boolean().nullable().default(false),
  crna_only_clinical_sites: z.coerce.boolean().nullable().default(false),

  // ? Program Culture
  program_culture_vibe: z.coerce.string().nullable().default(null),
  faculty_information: z.coerce.string().nullable().default(null),
  program_culture_comments: z.coerce.string().nullable().default(null),
  time_off_allowed_sick_days_policy: z.coerce.string().nullable().default(null),
  flexibility_for_learning_disabilities: z.coerce.string().nullable().default(null),
  support_for_underrepresented_minorities: z.coerce.boolean().nullable().default(false),

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

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const SchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  excerpt: z.string(),

  location: z.object({
    state: z.string(),
    city: z.string(),
  }),

  rank: z.number(),
  ratings: z.number(),

  images: z.object({
    thumbnailUrl: z.string(),
    imageUrl: z.string(),
  }),

  degreeType: z.object({
    DNP: z.boolean(),
    DNAP: z.boolean(),
    degreeTypeNotes: z.string(),
  }),

  programStructure: z.object({
    Integrated: z.boolean(),
    FrontLoaded: z.boolean(),
    programStructureNotes: z.string(),
  }),

  deadline: z.object({
    applicationDeadline: z.array(z.string()),
    applicationDeadlineNotes: z.string(),
  }),

  specialtyExperience: z.object({
    minimumICUExperience: z.number(),
    icuExperienceNotes: z.string(),
    criticalCareExperience: z.number(),
    NICU: z.boolean(),
    NICU_notes: z.string(),
    PICU: z.boolean(),
    PICU_notes: z.string(),
    ER: z.boolean(),
    ER_notes: z.string(),
    AdultICU: z.boolean(),
  }),

  gpa: z.object({
    minimumGpa: z.number(),
    minimumGpaNotes: z.string(),
    scienceGpa: z.number(),
    scienceGpaNotes: z.string(),
  }),

  other: z.object({
    gre: z.boolean(),
    greNotes: z.string(),
    shadowExperience: z.boolean(),
    shadowExperienceNotes: z.string(),
    ccrn: z.boolean(),
    ccrnNotes: z.string(),
    nursingCas: z.boolean(),
    nursingCasNotes: z.string(),
    bsnRequired: z.boolean(),
    bsnRequiredNotes: z.string(),
    onlineComponents: z.boolean(),
    onlineComponentsNotes: z.string(),
    last60Units: z.boolean(),
    last60UnitsNotes: z.string(),
  }),

  tuitionFee: z.object({
    inStateTuition: z.number(),
    inStateTuitionNotes: z.string(),
    outStateTuition: z.number(),
    outStateTuitionNotes: z.string(),
  }),

  prerequisite: z.object({
    statistics: z.boolean(),
    statisticsNotes: z.string(),
    chemistry: z.boolean(),
    chemistryNotes: z.string(),
    organicChem: z.boolean(),
    organicChemNotes: z.string(),
    bioChem: z.boolean(),
    bioChemNotes: z.string(),
    anatomy: z.boolean(),
    anatomyNotes: z.string(),
    physiology: z.boolean(),
    physiologyNotes: z.string(),
    pharmacology: z.boolean(),
    pharmacologyNotes: z.string(),
    physics: z.boolean(),
    physicsNotes: z.string(),
    microBio: z.boolean(),
    microBioNotes: z.string(),
    research: z.boolean(),
    researchNotes: z.string(),
    pathophysiology: z.boolean(),
    pathophysiologyNotes: z.string(),
    healthPhysicalAssessment: z.boolean(),
    healthPhysicalAssessmentNotes: z.string(),
    math: z.boolean(),
    mathNotes: z.string(),
  }),

  facilities: z.object({
    simulationLab: z.boolean(),
    simulationLabNotes: z.string(),
    cadaverLab: z.boolean(),
    cadaverLabNotes: z.string(),
    crnaOnlySites: z.boolean(),
    crnaOnlySitesNotes: z.string(),
  }),

  class: z.object({
    classSize: z.number(),
    classSizeCategory: z.string(),
    classSizeNotes: z.string(),
  }),

  statistics: z.object({
    acceptanceRate: z.number(),
    attritionRate: z.number(),
    boardPassingRate: z.number(),
  }),
});

export type School = z.infer<typeof SchoolSchema>;

export interface SchoolCompareReturn {
  location: {
    city: string;
    state: string;
  };
  title: string;
}

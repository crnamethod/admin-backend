import type { z } from "zod";
import { PrerequisiteSchoolSchema } from "../models/prerequisite-school.model";

export type UpdatePrerequisiteSchoolDto = z.infer<typeof UpdatePrerequisiteSchoolSchema>;

export const UpdatePrerequisiteSchoolSchema = PrerequisiteSchoolSchema.omit({ schoolId: true, prerequisiteId: true, name: true }).partial().strict();

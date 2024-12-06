import type { z } from "zod";

import { PrerequisiteSchema } from "../models/prerequisite.model";

export type UpdatePrerequisiteDto = z.infer<typeof UpdatePrerequisiteSchema>;

export const UpdatePrerequisiteSchema = PrerequisiteSchema.pick({ label: true }).partial().strict();

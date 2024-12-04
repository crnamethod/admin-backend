import { Router } from "express";

import { validateRequest } from "@/common/utils/httpHandlers";

import { prerequisiteSchoolController } from "./controllers/prerequisite-school.controller";
import { CreatePrerequisiteSchoolSchema } from "./dto/create-prerequisite-school.dto";
import { FindPrerequisiteBySchoolSchema, FindPrerequisiteSchoolSchema } from "./dto/get-prerequisite-school.dto";

export const prerequisiteSchoolRouter: Router = Router();

prerequisiteSchoolRouter.post(
  "/",
  validateRequest({ body: CreatePrerequisiteSchoolSchema }),
  prerequisiteSchoolController.create,
);
prerequisiteSchoolRouter.get(
  "/",
  validateRequest({ query: FindPrerequisiteBySchoolSchema }),
  prerequisiteSchoolController.findAllBySchool,
);
prerequisiteSchoolRouter.get("/all", prerequisiteSchoolController.findAll);
prerequisiteSchoolRouter.get(
  "/one",
  validateRequest({ query: FindPrerequisiteSchoolSchema }),
  prerequisiteSchoolController.findOne,
);

import { Router } from "express";

import { validateRequest } from "@/common/utils/httpHandlers";

import { prerequisiteController } from "./controllers/prerequisite.controller";
import { CreatePrerequisiteSchema } from "./dto/create-prerequisite.dto";

export const prerequisiteRouter: Router = Router();

prerequisiteRouter.post("/", validateRequest({ body: CreatePrerequisiteSchema }), prerequisiteController.create);
prerequisiteRouter.get("/", prerequisiteController.findAll);
prerequisiteRouter.get("/:id", prerequisiteController.findOne);

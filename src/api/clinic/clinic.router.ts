import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { clinicController } from "./clinic.controller";
import { ClinicSchema } from "./clinic.model";
import { CreateClinicSchema } from "./dto/create-clinic.dto";
import { FindAllClinicBySchoolSchema } from "./dto/get-all-clinic-by-school.dto";
import { FindAllClinicSchema } from "./dto/get-all-clinic.dto";
import { UpdateClinicSchema } from "./dto/update-clinic.dto";

export const clinicRegistry = new OpenAPIRegistry();

clinicRegistry.register("Clinic", ClinicSchema);

clinicRegistry.registerPath({
  method: "get",
  path: "/clinic",
  tags: ["User"],
  responses: createApiResponse(z.array(ClinicSchema), "Success"),
});

export const clinicRouter: Router = express.Router();

clinicRouter.post("/", validateRequest({ body: CreateClinicSchema }), clinicController.createClinic);

clinicRouter.patch("/:id", validateRequest({ body: UpdateClinicSchema }), clinicController.updateClinic);

clinicRouter.get("/all", validateRequest({ query: FindAllClinicSchema }), clinicController.getAll);

clinicRouter.get("/", validateRequest({ query: FindAllClinicBySchoolSchema }), clinicController.findAllBySchool);

clinicRouter.get("/:id", clinicController.getOne);

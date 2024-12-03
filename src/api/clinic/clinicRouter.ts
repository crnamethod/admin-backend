import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { clinicController } from "./clinicController";
import { ClinicSchema, CreateClinicSchema } from "./clinicModel";
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

export const clinicRouter: Router = (() => {
  const router = express.Router();

  router.post("/", validateRequest({ body: CreateClinicSchema }), clinicController.createClinic);

  router.patch("/:id", validateRequest({ body: UpdateClinicSchema }), clinicController.updateClinic);

  router.get("/", validateRequest({ query: FindAllClinicSchema }), clinicController.getAll);

  router.get("/:id", clinicController.getOne);

  return router;
})();

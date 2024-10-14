import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { ClinicSchema, CreateClinicSchema } from "./clinicModel";
import { clinicController } from "./clinicController";
import { FindAllClinicSchema, FindPerId } from "./dto/get-all-clinic.dto";

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

  router.get(
    "/",
    validateRequest(z.object({ query: FindAllClinicSchema.strip().strict() })),
    clinicController.getAll
  );

  router.get(
    "/:clinicId",
    validateRequest(z.object({ params: FindPerId })),
    clinicController.getOne
  );

  router.patch(
    "/:clinicId",
    validateRequest(
      z.object({ body: ClinicSchema.partial().strip().strict() })
    ),
    clinicController.updateClinic
  );

  router.post(
    "/",
    validateRequest(z.object({ body: CreateClinicSchema })),
    clinicController.createClinic
  );

  return router;
})();

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";

import { clinicReviewController } from "./clinic-review.controller";
import { ClinicReviewSchema } from "./clinic-review.model";
import { FindAllClinicReviewSchema } from "./dto/get-all-clinic-review.dto";
import { UpdateClinicReviewSchema } from "./dto/update-clinic-review.dto";

export const clinicReviewRegistry = new OpenAPIRegistry();
export const clinicReviewRouter: Router = Router();

clinicReviewRegistry.registerPath({
  method: "get",
  path: "/clinic-review",
  tags: ["Clinic Review"],
  request: {
    query: FindAllClinicReviewSchema,
  },
  responses: {
    "200": {
      description: "Success",
      content: {
        "application/json": {
          schema: z.array(ClinicReviewSchema),
        },
      },
    },
  },
});

clinicReviewRouter.get("/", validateRequest({ query: FindAllClinicReviewSchema }), clinicReviewController.findAll);

clinicReviewRegistry.registerPath({
  method: "patch",
  path: "/clinic-review/{reviewId}",
  tags: ["Clinic Review"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateClinicReviewSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.array(ClinicReviewSchema), "Success"),
});

clinicReviewRouter.patch("/:id", validateRequest({ body: UpdateClinicReviewSchema }), clinicReviewController.update);

clinicReviewRegistry.registerPath({
  method: "get",
  path: "/clinic-review/{reviewId}",
  tags: ["Clinic Review"],
  responses: createApiResponse(ClinicReviewSchema, "Success"),
});
clinicReviewRouter.get("/:id", clinicReviewController.findOne);

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { schoolController } from "./schoolController";
import { SchoolSchema } from "./schoolModel";

export const schoolRegistry = new OpenAPIRegistry();
export const schoolRouter: Router = express.Router();

schoolRegistry.register("School", SchoolSchema);

schoolRegistry.registerPath({
  method: "get",
  path: "/schools",
  tags: ["School"],
  responses: createApiResponse(z.array(SchoolSchema), "Success"),
});

schoolRouter.get("/", schoolController.getShools);

const GetSchoolSchema = z.object({
  params: z.object({ id: z.string() }),
});

schoolRegistry.registerPath({
  method: "get",
  path: "/schools/{id}",
  tags: ["School"],
  request: { params: GetSchoolSchema.shape.params },
  responses: createApiResponse(SchoolSchema, "Success"),
});

schoolRouter.get("/:id", validateRequest(GetSchoolSchema), schoolController.getShool);

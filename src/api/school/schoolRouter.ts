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

const GetSchoolsQuerySchema = z.object({
  query: z
    .object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseInt(val, 10) : undefined)),
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .refine((data) => !data.id || (data.id && data.name), {
      message: "'name' is required when 'id' is provided.",
      path: ["name"],
    })
    .refine((data) => !data.name || (data.name && data.id), {
      message: "'id' is required when 'name' is provided.",
      path: ["id"],
    }),
});

schoolRegistry.registerPath({
  method: "get",
  path: "/school",
  tags: ["School"],
  responses: createApiResponse(z.array(SchoolSchema), "Success"),
});

schoolRouter.get("/", validateRequest(GetSchoolsQuerySchema), schoolController.getShools);

const GetSchoolSchema = z.object({
  params: z.object({ id: z.string() }),
});

schoolRegistry.registerPath({
  method: "get",
  path: "/school/{id}",
  tags: ["School"],
  request: { params: GetSchoolSchema.shape.params },
  responses: createApiResponse(SchoolSchema, "Success"),
});

schoolRouter.get("/:id", validateRequest(GetSchoolSchema), schoolController.getShool);

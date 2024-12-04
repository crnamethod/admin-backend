import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { UploadImageSchema } from "@/common/dto/upload-image.dto";
import { validateRequest } from "@/common/utils/httpHandlers";

import { AssignClinicSchema } from "./dto/assign-clinic.dto";
import { CreateSchoolSchema } from "./dto/create-school.dto";
import { GetSchoolsQuerySchema } from "./dto/filter-school.dto";
import { RemoveClinicSchema } from "./dto/remove-clinic.dto";
import { RemovePrerequisiteSchema } from "./dto/remove-prerequisite.dto";
import { UpdateSchoolSchema } from "./dto/update-school.dto";
import { SchoolImageBodySchema } from "./dto/upload-image.dto";
import { SchoolSchema } from "./school.model";
import { schoolController } from "./schoolController";

export const schoolRegistry = new OpenAPIRegistry();
export const schoolRouter: Router = express.Router();

schoolRegistry.register("School", SchoolSchema);

schoolRegistry.registerPath({
  method: "get",
  path: "/school",
  tags: ["School"],
  responses: createApiResponse(z.array(SchoolSchema), "Success"),
});

schoolRouter.get("/", validateRequest({ query: GetSchoolsQuerySchema }), schoolController.getShools);

const GetSchoolSchema = z.object({
  id: z.string(),
});

schoolRegistry.registerPath({
  method: "get",
  path: "/school/{id}",
  tags: ["School"],
  request: { params: GetSchoolSchema },
  responses: createApiResponse(SchoolSchema, "Success"),
});

schoolRouter.get("/:id", validateRequest({ params: GetSchoolSchema }), schoolController.getShool);

schoolRegistry.registerPath({
  method: "patch",
  path: "/school/update",
  tags: ["School"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateSchoolSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.array(SchoolSchema), "Schools updated successfully"),
});

schoolRouter.patch("/update", validateRequest({ body: UpdateSchoolSchema }), schoolController.updateShool);

schoolRegistry.registerPath({
  method: "post",
  path: "/school",
  tags: ["School"],
  description: "Add a new school",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SchoolSchema,
        },
      },
    },
  },
  responses: createApiResponse(SchoolSchema, "School added successfully"),
});

schoolRouter.post("/", validateRequest({ body: CreateSchoolSchema }), schoolController.addSchool);

schoolRouter.post("/assign-clinic", validateRequest({ body: AssignClinicSchema }), schoolController.assignClinic);
schoolRouter.post("/remove-clinic", validateRequest({ body: RemoveClinicSchema }), schoolController.removeClinic);

schoolRouter.post(
  "/remove-prerequisite",
  validateRequest({ body: RemovePrerequisiteSchema }),
  schoolController.removePrerequisite,
);

schoolRouter.post(
  "/upload",
  validateRequest({ body: SchoolImageBodySchema, files: { schema: UploadImageSchema, fileName: "file" } }),
  schoolController.uploadPicture,
);

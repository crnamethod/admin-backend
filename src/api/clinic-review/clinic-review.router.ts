import { validateRequest } from "@/common/utils/httpHandlers";
import { Router } from "express";

import { clinicReviewController } from "./clinic-review.controller";
import { FindAllClinicReviewSchema } from "./dto/get-all-clinic-review.dto";
import { UpdateClinicReviewSchema } from "./dto/update-clinic-review.dto";

export const clinicReviewRouter: Router = Router();

clinicReviewRouter.get("/", validateRequest({ query: FindAllClinicReviewSchema }), clinicReviewController.findAll);
clinicReviewRouter.patch("/:id", validateRequest({ body: UpdateClinicReviewSchema }), clinicReviewController.update);
clinicReviewRouter.get("/:id", clinicReviewController.findOne);

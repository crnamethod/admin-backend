import { validateRequest } from "@/common/utils/httpHandlers";
import { Router } from "express";
import { clinicReviewController } from "./clinic-review.controller";
import { CreateClinicReviewSchema } from "./dto/create-clinic-review.dto";
import { QueryClinicReviewSchema, QueryOneClinicReviewSchema } from "./dto/query-clinic-review.dto";
import { UpdateClinicReviewSchema } from "./dto/update-clinic-review.dto";

export const clinicReviewRouter: Router = Router();

clinicReviewRouter.post("/", validateRequest({ body: CreateClinicReviewSchema }), clinicReviewController.create);
clinicReviewRouter.patch("/:id", validateRequest({ body: UpdateClinicReviewSchema }), clinicReviewController.update);
clinicReviewRouter.get("/", validateRequest({ body: QueryClinicReviewSchema }), clinicReviewController.findAllByClinic);
clinicReviewRouter.get("/:id", validateRequest({ body: QueryOneClinicReviewSchema }), clinicReviewController.findOne);

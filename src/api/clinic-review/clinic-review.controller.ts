import expressAsyncHandler from "express-async-handler";

import type { TypedRequestBody, TypedRequestQuery } from "@/common/types/request.type";

import { clinicReviewService } from "./clinic-review.service";
import type { QueryClinicReviewDto, QueryOneClinicReviewDto } from "./dto/query-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";

class ClinicReviewController {
  public update = expressAsyncHandler(async (req: TypedRequestBody<UpdateClinicReviewDto>, res) => {
    const data = await clinicReviewService.updateReview(req.params.id, req.body);
    res.status(data.statusCode).json(data);
  });

  public findAllByClinic = expressAsyncHandler(async (req: TypedRequestQuery<QueryClinicReviewDto>, res) => {
    const data = await clinicReviewService.findAllByClinic(req.query);
    res.status(data.statusCode).json(data);
  });

  public findOne = expressAsyncHandler(async (req: TypedRequestQuery<QueryOneClinicReviewDto>, res) => {
    const data = await clinicReviewService.findOneByQuery(req.params.id, req.query.userId);
    res.status(data.statusCode).json(data);
  });
}

export const clinicReviewController = new ClinicReviewController();

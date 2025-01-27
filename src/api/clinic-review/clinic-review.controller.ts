import expressAsyncHandler from "express-async-handler";

import type { TypedRequestBody, TypedRequestQuery } from "@/common/types/request.type";

import { clinicReviewService } from "./clinic-review.service";
import type { FindAllClinicReviewDto } from "./dto/get-all-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";

class ClinicReviewController {
  public findAll = expressAsyncHandler(async (req: TypedRequestQuery<FindAllClinicReviewDto>, res) => {
    const data = await clinicReviewService.findAll(req.query);
    res.status(200).json(data);
  });

  public update = expressAsyncHandler(async (req: TypedRequestBody<UpdateClinicReviewDto>, res) => {
    const data = await clinicReviewService.updateReview(req.params.id, req.body);
    res.status(data.statusCode).json(data);
  });

  public findOne = expressAsyncHandler(async (req, res) => {
    const data = await clinicReviewService.findOneOrThrow(req.params.id);
    res.status(data.statusCode).json(data);
  });
}

export const clinicReviewController = new ClinicReviewController();

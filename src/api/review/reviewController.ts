import type { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";

import type { TypedRequestBody, TypedRequestQuery } from "@/common/types/request.type";

import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import type { UpdateReviewDto } from "./dto/update-review.dto";
import { reviewService } from "./reviewService";

class ReviewController {
  public getReviews = async (req: TypedRequestQuery<FindAllReviewDto>, res: Response) => {
    const data = await reviewService.findAll(req.query);

    res.status(200).json(data);
  };

  public update = expressAsyncHandler(async (req: TypedRequestBody<UpdateReviewDto>, res) => {
    const data = await reviewService.updateReview(req.params.id, req.body);
    res.status(data.statusCode).json(data);
  });

  public getReview: RequestHandler = async (req: Request, res: Response) => {
    const data = await reviewService.findOneOrThrow(req.params.reviewId);

    res.status(data.statusCode).json(data);
  };

  public getReviewsPerSchool: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await reviewService.findReviewsBySchoolId(req.params.schoolId);

    res.status(data.statusCode).json(data);
  });
}

export const reviewController = new ReviewController();

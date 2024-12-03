import type { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";

import { reviewService } from "./reviewService";

class ReviewController {
  public getReviews: RequestHandler = async (req: Request, res: Response) => {
    const data = await reviewService.getReviews(req.query);
    res.status(data.statusCode).json(data);
  };

  public getReview: RequestHandler = async (req: Request, res: Response) => {
    const data = await reviewService.findOneOrThrow(req.params.reviewId);
    res.status(data.statusCode).json(data);
  };

  public getReviewsPerSchool: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await reviewService.getReviewsBySchool(req.params.schoolId);
    res.status(data.statusCode).json(data);
  });
}

export const reviewController = new ReviewController();

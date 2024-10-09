import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { getReview, getReviews } from "./reviewService";

class ReviewController {
  public getReviews: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await getReviews(req.query);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getReview: RequestHandler = async (req: Request, res: Response) => {
    try {
      const reviewId = req.params.reviewId as string;
      const data = await getReview(reviewId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const reviewController = new ReviewController();

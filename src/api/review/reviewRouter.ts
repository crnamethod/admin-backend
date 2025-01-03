import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { reviewController } from "./reviewController";
import { ReviewSchema } from "./reviewModel";

export const reviewRegistry = new OpenAPIRegistry();
export const reviewRouter: Router = express.Router();

reviewRegistry.register("Review", ReviewSchema);

reviewRegistry.registerPath({
  method: "get",
  path: "/review",
  tags: ["Review"],
  responses: createApiResponse(z.array(ReviewSchema), "Success"),
});

reviewRouter.get("/", reviewController.getReviews);

reviewRegistry.registerPath({
  method: "get",
  path: "/review/{reviewId}",
  tags: ["Review"],
  responses: createApiResponse(z.array(ReviewSchema), "Success"),
});

reviewRouter.get("/:reviewId", reviewController.getReview);

reviewRegistry.registerPath({
  method: "get",
  path: "/review/school/{schoolId}",
  tags: ["Review"],
  responses: createApiResponse(z.array(ReviewSchema), "Success"),
});

reviewRouter.get("/school/:schoolId", reviewController.getReviewsPerSchool);

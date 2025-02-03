import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";

import { FindAllReviewSchema } from "./dto/get-all-review.dto";
import { UpdateReviewSchema } from "./dto/update-review.dto";
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

reviewRouter.get("/", validateRequest({ query: FindAllReviewSchema }), reviewController.getReviews);

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

reviewRegistry.registerPath({
  method: "patch",
  path: "/review/{reviewId}",
  tags: ["Review"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateReviewSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.array(ReviewSchema), "Success"),
});

reviewRouter.patch("/:id", validateRequest({ body: UpdateReviewSchema }), reviewController.update);

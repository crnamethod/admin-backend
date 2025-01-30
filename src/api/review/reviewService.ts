import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

import { schoolService } from "../school/schoolService";
import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import { ReviewEntity } from "./entity/review.entity";
import { reviewRepository } from "./reviewRepository";

class ReviewService {
  async findAll(query: FindAllReviewDto) {
    const result = await reviewRepository.findAll(query, {
      ProjectionExpression: "reviewId, schoolId, userId, #email, #status, #rating, is_recommended, best_things, downsides, updatedAt",
      ExpressionAttributeNames: {
        "#email": "email",
        "#status": "status",
        "#rating": "rating",
      },
    });

    result.data = await Promise.all(
      result.data.map(async (data) => {
        const school = await schoolService.findOneOrThrow(data.schoolId, { ProjectionExpression: "#name", ExpressionAttributeNames: { "#name": "name" } });

        return new ReviewEntity({ ...data, school_name: school.name });
      }),
    );

    return result;
  }

  async findOne(reviewId: string) {
    const review = await reviewRepository.findOne(reviewId);
    return ServiceResponse.success("Review fetched successfully", review, StatusCodes.OK);
  }

  async findOneOrThrow(reviewId: string) {
    const review = await reviewRepository.findOne(reviewId);

    if (!review) throw new HttpException("Review not found", 404);

    const { name } = await schoolService.findOneOrThrow(review.schoolId, { ProjectionExpression: "#name", ExpressionAttributeNames: { "#name": "name" } });

    review.school_name = name;

    return ServiceResponse.success("Review fetched successfully", review, StatusCodes.OK);
  }

  async findReviewsBySchoolId(schoolId: string) {
    const reviews = await reviewRepository.findManyBySchool(schoolId);

    return ServiceResponse.success("Reviews by School fetched successfully", reviews, StatusCodes.OK);
  }
}

export const reviewService = new ReviewService();

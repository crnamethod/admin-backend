import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { HttpException } from "@/common/utils/http-exception";

import { schoolService } from "../school/schoolService";
import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import type { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewEntity } from "./entity/review.entity";
import { reviewRepository } from "./reviewRepository";

class ReviewService {
  async findAll(query: FindAllReviewDto) {
    const result = await reviewRepository.findAll(query, {
      ProjectionExpression: "reviewId, schoolId, userId, #email, #status, #rating, is_recommended, best_things, downsides, createdAt, updatedAt",
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

  async updateReview(reviewId: string, dto: UpdateReviewDto) {
    await this.findOneOrThrow(reviewId, { ProjectionExpression: "reviewId, userId" });

    const updatedReview = await reviewRepository.update(reviewId, dto);

    return ServiceResponse.success("Review updated successfully", updatedReview, StatusCodes.OK);
  }

  async findOne(reviewId: string, options?: GetCommandOptions) {
    const review = await reviewRepository.findOne(reviewId, options);
    return ServiceResponse.success("Review fetched successfully", review, StatusCodes.OK);
  }

  async findOneOrThrow(reviewId: string, options?: GetCommandOptions) {
    const review = await reviewRepository.findOne(reviewId, options);

    if (!review) throw new HttpException("Review not found", 404);

    if (review.schoolId) {
      const { name } = await schoolService.findOneOrThrow(review.schoolId, { ProjectionExpression: "#name", ExpressionAttributeNames: { "#name": "name" } });

      review.school_name = name;
    }

    return ServiceResponse.success("Review fetched successfully", review, StatusCodes.OK);
  }

  async findReviewsBySchoolId(schoolId: string) {
    const reviews = await reviewRepository.findManyBySchool(schoolId);

    return ServiceResponse.success("Reviews by School fetched successfully", reviews, StatusCodes.OK);
  }
}

export const reviewService = new ReviewService();

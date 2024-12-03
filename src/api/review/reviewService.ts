import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import { reviewRepository } from "./reviewRepository";

class ReviewService {
  async getReviews(query: FindAllReviewDto) {
    const reviews = await reviewRepository.findAll(query);

    return ServiceResponse.success("Reviews fetched successfully", reviews, StatusCodes.OK);
  }

  async findOne(reviewId: string) {
    const review = await reviewRepository.findOne(reviewId);
    return ServiceResponse.success("Review fetched successfully", review, StatusCodes.OK);
  }

  async findOneOrThrow(reviewId: string) {
    const review = await reviewRepository.findOne(reviewId);

    if (!review) throw new HttpException("Review not found", 404);

    return ServiceResponse.success("Review fetched successfully", review, StatusCodes.OK);
  }

  async getReviewsBySchool(schoolId: string) {
    const reviews = await reviewRepository.findReviewsBySchoolIdAsync(schoolId);

    return ServiceResponse.success("Reviews by School fetched successfully", reviews, StatusCodes.OK);
  }
}

export const reviewService = new ReviewService();

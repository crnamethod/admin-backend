import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { clinicReviewRepository } from "./clinic-review.repository";
import type { FindAllClinicReviewDto } from "./dto/get-all-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";

class ClinicReviewService {
  async findAll(query: FindAllClinicReviewDto) {
    return await clinicReviewRepository.findAll(query);
  }

  async updateReview(reviewId: string, dto: UpdateClinicReviewDto) {
    const { userId, ...data } = dto;

    const foundReview = await clinicReviewRepository.findOne(reviewId, { ProjectionExpression: "reviewId, userId, clinicId" });

    if (foundReview?.userId !== userId) {
      throw new HttpException(`You can't update this review`, 400);
    }

    const updatedReview = await clinicReviewRepository.update(reviewId, data);

    return ServiceResponse.success("Clinic Review updated successfully", updatedReview, StatusCodes.OK);
  }

  async findOneOrThrow(reviewId: string, options?: GetCommandOptions) {
    const clinicReview = await clinicReviewRepository.findOne(reviewId, options);

    if (!clinicReview) throw new HttpException("Clinic Review not found", 404);

    return ServiceResponse.success("Clinic Review fetched successfully", clinicReview, StatusCodes.OK);
  }

  async calculateRatings(clinicId: string) {
    const reviews = await clinicReviewRepository.calculateRating(clinicId);

    return ServiceResponse.success("Reviews retrieved successfully", reviews, StatusCodes.OK);
  }
}

export const clinicReviewService = new ClinicReviewService();

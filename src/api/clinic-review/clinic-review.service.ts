import { StatusCodes } from "http-status-codes";

import { ResponseStatus, ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

// import { pollService } from "../poll/pollService";
import { clinicReviewRepository } from "./clinic-review.repository";
import type { CreateClinicReviewDto } from "./dto/create-clinic-review.dto";
import type { QueryClinicReviewDto } from "./dto/query-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";

class ClinicReviewService {
  async createReview(dto: CreateClinicReviewDto) {
    const foundReview = await clinicReviewRepository.findByClinicIdAndUserId(dto.clinicId, dto.userId, "reviewId");

    if (foundReview) throw new HttpException("Review already exists", 409);

    const newReview = await clinicReviewRepository.create(dto);

    return ServiceResponse.success("Clinic Review created successfully", newReview, StatusCodes.CREATED);
  }

  async updateReview(reviewId: string, dto: UpdateClinicReviewDto) {
    const { userId, ...data } = dto;

    const foundReview = await clinicReviewRepository.findOne(reviewId, "reviewId, userId, clinicId");

    if (foundReview?.userId !== userId) {
      throw new HttpException(`You can't update this review`, 400);
    }

    const updatedReview = await clinicReviewRepository.update(reviewId, data);

    return ServiceResponse.success("Clinic Review updated successfully", updatedReview, StatusCodes.OK);
  }

  async findOneByQuery(reviewId: string, userId: string) {
    const clinicReview = await clinicReviewRepository.findOneByQuery(reviewId, userId);

    if (!clinicReview) throw new HttpException("Clinic Review nout found", 404);

    // clinicReview.polls = await pollService.findManyByClinic(clinicReview.clinicId);

    return ServiceResponse.success("Clinic Review fetched successfully", clinicReview, StatusCodes.OK);
  }

  async findAllByClinic(query: QueryClinicReviewDto) {
    const clinicReviews = await clinicReviewRepository.findAllByClinic(query.clinicId);

    return ServiceResponse.success("Clinic Reviews fetched successfully", clinicReviews, StatusCodes.OK);
  }

  async calculateRatings(clinicId: string) {
    const clinicReviews = await clinicReviewRepository.findAllByClinic(clinicId, "rating");
    const totalRating = clinicReviews.reduce((sum, review) => sum + review.rating, 0);
    return clinicReviews.length ? totalRating / clinicReviews.length : 0;
  }
}

export const clinicReviewService = new ClinicReviewService();

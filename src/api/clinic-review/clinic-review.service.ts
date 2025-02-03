import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { HttpException } from "@/common/utils/http-exception";

import { clinicService } from "../clinic/clinic.service";
import { clinicReviewRepository } from "./clinic-review.repository";
import type { FindAllClinicReviewDto } from "./dto/get-all-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";
import { ClinicReviewEntity } from "./entity/clinic-review.entity";

class ClinicReviewService {
  async findAll(query: FindAllClinicReviewDto) {
    const result = await clinicReviewRepository.findAll(query, {
      ProjectionExpression: "reviewId, clinicId, userId, #email, #status, #rating, feedback, updatedAt",
      ExpressionAttributeNames: {
        "#email": "email",
        "#status": "status",
        "#rating": "rating",
      },
    });

    result.data = await Promise.all(
      result.data.map(async (data) => {
        const { responseObject: clinic } = await clinicService.findOneOrThrow(data.clinicId, {
          ProjectionExpression: "#name",
          ExpressionAttributeNames: { "#name": "name" },
        });

        return new ClinicReviewEntity({ ...data, clinic_name: clinic.name });
      }),
    );

    return result;
  }

  async updateReview(reviewId: string, dto: UpdateClinicReviewDto) {
    await this.findOneOrThrow(reviewId, { ProjectionExpression: "reviewId, userId" });

    const updatedReview = await clinicReviewRepository.update(reviewId, dto);

    return ServiceResponse.success("Clinic Review updated successfully", updatedReview, StatusCodes.OK);
  }

  async findOneOrThrow(reviewId: string, options?: GetCommandOptions) {
    const clinicReview = await clinicReviewRepository.findOne(reviewId, options);

    if (!clinicReview) throw new HttpException("Clinic Review not found", 404);

    const { responseObject: clinic } = await clinicService.findOneOrThrow(clinicReview.clinicId, {
      ProjectionExpression: "#name",
      ExpressionAttributeNames: { "#name": "name" },
    });

    clinicReview.clinic_name = clinic.name;

    return ServiceResponse.success("Clinic Review fetched successfully", clinicReview, StatusCodes.OK);
  }

  async calculateRatings(clinicId: string) {
    const reviews = await clinicReviewRepository.calculateRating(clinicId);

    return ServiceResponse.success("Reviews retrieved successfully", reviews, StatusCodes.OK);
  }
}

export const clinicReviewService = new ClinicReviewService();

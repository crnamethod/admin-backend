import {
  GetCommand,
  type GetCommandInput,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { calculateAverage } from "@/common/utils/number";
import { updateDataHelper } from "@/common/utils/update";

import { clinicService } from "../clinic/clinic.service";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";
import { ClinicReviewEntity } from "./entity/clinic-review.entity";

const TableName = env.DYNAMODB_TBL_CLINIC_REVIEWS;

class ClinicReviewRepository {
  async update(reviewId: string, updateDto: Omit<UpdateClinicReviewDto, "userId">) {
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(updateDto);

    const params: UpdateCommandInput = {
      TableName,
      Key: { reviewId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    // console.log('Update params:', JSON.stringify(params, null, 2));
    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new ClinicReviewEntity(Attributes!);
  }

  async findByClinicIdAndUserId(clinicId: string, userId: string, ProjectionExpression?: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "ClinicUserIndex",
      KeyConditionExpression: "clinicId = :clinicId AND userId = :userId",
      ExpressionAttributeValues: {
        ":clinicId": clinicId,
        ":userId": userId,
      },
      ...(ProjectionExpression && { ProjectionExpression }),
    };

    // ? Check if clinicId is existing in the Database
    await clinicService.findOneOrThrow(clinicId);

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) return new ClinicReviewEntity(Items[0]);

    return null;
  }

  async findOne(reviewId: string, options?: GetCommandOptions) {
    const params: GetCommandInput = {
      TableName,
      Key: { reviewId },
      ...options,
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new ClinicReviewEntity(Item) : null;
  }

  async findOneByQuery(reviewId: string, userId: string, ProjectionExpression?: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "ReviewUserIndex",
      KeyConditionExpression: "reviewId = :reviewId AND userId = :userId",
      ExpressionAttributeValues: {
        ":reviewId": reviewId,
        ":userId": userId,
      },
      ...(ProjectionExpression && { ProjectionExpression }),
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) return new ClinicReviewEntity(Items[0]);

    return null;
  }

  async findAllByClinic(clinicId: string, ProjectionExpression?: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "ClinicUserIndex",
      KeyConditionExpression: "clinicId = :clinicId",
      ExpressionAttributeValues: {
        ":clinicId": clinicId,
      },
      ...(ProjectionExpression && { ProjectionExpression }),
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new ClinicReviewEntity(item));

    return [];
  }

  async calculateRating(clinicId: string) {
    const clinicReviews = await this.findAllByClinic(clinicId, "rating");

    const totalRating = clinicReviews.reduce((sum, review) => sum + review.rating, 0);

    const ratings = {
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0,
    };

    clinicReviews.forEach((review) => {
      if (review.rating === 5) ratings.five_star++;
      else if (review.rating === 4) ratings.four_star++;
      else if (review.rating === 3) ratings.three_star++;
      else if (review.rating === 2) ratings.two_star++;
      else if (review.rating === 1) ratings.one_star++;
    });

    return {
      total_reviews: clinicReviews.length,
      avg_rating: calculateAverage(totalRating, clinicReviews.length),
      ratings,
    };
  }
}

export const clinicReviewRepository = new ClinicReviewRepository();

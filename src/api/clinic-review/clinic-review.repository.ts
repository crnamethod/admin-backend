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

import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { updateDataHelper } from "@/common/utils/update";

import { clinicService } from "../clinic/clinic.service";
import type { CreateClinicReviewDto } from "./dto/create-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";
import { ClinicReviewEntity } from "./entity/clinic-review.entity";

const TableName = env.DYNAMODB_TBL_CLINIC_REVIEWS;

class ClinicReviewRepository {
  async create(dto: CreateClinicReviewDto) {
    const { /* polls, */ ...createClinicData } = dto;
    const newClinicReviewEntity = new ClinicReviewEntity(createClinicData, false);

    const params: PutCommandInput = {
      TableName,
      Item: newClinicReviewEntity,
    };

    // ? Create Polls for the clinic review
    // await pollService.create(createClinicData.clinicId, newClinicReviewEntity.reviewId, polls);

    // ? Create new clinic review
    await dynamoClient.send(new PutCommand(params));

    return newClinicReviewEntity;
  }

  async update(reviewId: string, dto: Omit<UpdateClinicReviewDto, "userId">) {
    const { /* polls,  */ ...updateDto } = dto;
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(updateDto);

    const params: UpdateCommandInput = {
      TableName,
      Key: { reviewId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    };

    console.log("Update params:", JSON.stringify(params, null, 2));
    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    const updatedReview = new ClinicReviewEntity(Attributes!);

    // TODO: Refactor Update Polls
    /* if (polls && polls.length > 0) {
      updatedReview.polls = await pollService.update(updatedReview.clinicId, polls);
    } */

    return updatedReview;
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

  async findOne(reviewId: string, ProjectionExpression?: string) {
    const params: GetCommandInput = {
      TableName,
      Key: { reviewId },
      ...(ProjectionExpression && { ProjectionExpression }),
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
}

export const clinicReviewRepository = new ClinicReviewRepository();

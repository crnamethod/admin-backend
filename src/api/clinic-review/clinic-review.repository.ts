import {
  GetCommand,
  type GetCommandInput,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
  paginateQuery,
} from "@aws-sdk/lib-dynamodb";

import type { GetCommandOptions, QueryCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { calculateAverage } from "@/common/utils/number";
import { updateDataHelper } from "@/common/utils/update";

import type { FindAllClinicReviewDto } from "./dto/get-all-clinic-review.dto";
import type { UpdateClinicReviewDto } from "./dto/update-clinic-review.dto";
import { ClinicReviewEntity } from "./entity/clinic-review.entity";

const TableName = env.DYNAMODB_TBL_CLINIC_REVIEWS;

class ClinicReviewRepository {
  async findAll(query: FindAllClinicReviewDto, options?: QueryCommandOptions) {
    const { limit = 10, startingToken, ...filters } = query || {};

    const params = this.findAllQuery({ limit, ...filters }, options);

    console.log("Query Command Params: ", JSON.stringify(params, null, 2));

    const paginator = paginateQuery({ client: dynamoClient, startingToken }, params);

    const accumulatedItems: any[] = [];
    let lastEvaluatedKey: any;

    for await (const page of paginator) {
      const remainingLimit = limit - accumulatedItems.length;
      accumulatedItems.push(...page.Items!.slice(0, remainingLimit));

      // ? If the accumulated items length is exactly the same with the limit
      if (remainingLimit % limit === 0 && accumulatedItems.length >= limit) {
        lastEvaluatedKey = page.LastEvaluatedKey;
        break;
      } else if (accumulatedItems.length >= limit) {
        break;
      }

      // ? Reassign the value for the last evaluated key if there's still remaining items to be pushed
      lastEvaluatedKey = page.LastEvaluatedKey;
    }

    const reviews = accumulatedItems.map((item) => new ClinicReviewEntity(item));

    return {
      lastEvaluatedKey: lastEvaluatedKey ?? null,
      total: reviews.length,
      data: reviews,
    };
  }

  private findAllQuery(filters: Omit<FindAllClinicReviewDto, "startingToken">, options?: QueryCommandOptions) {
    const { search, limit, sort_by_date, startDate, endDate, clinicId, email, rating, status } = filters;

    const params: QueryCommandInput = {
      TableName,
      Limit: limit,
      ScanIndexForward: sort_by_date === "asc", // true for ascending, false for descending
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      ...options,
    };

    const filterExpressions: string[] = [];

    if (clinicId) {
      params.IndexName = "ClinicCreatedAtIndex";
      params.KeyConditionExpression = "clinicId = :clinicId";
      params.ExpressionAttributeValues![":clinicId"] = clinicId;
    } else {
      params.IndexName = "UpdatedAtIndex";
      params.KeyConditionExpression = "#gsiKey = :gsiValue";
      params.ExpressionAttributeValues![":gsiValue"] = "ALL";
      params.ExpressionAttributeNames!["#gsiKey"] = "gsiPartitionKey";
    }

    if (startDate && endDate) {
      const dateKey = params.IndexName !== "UpdatedAtIndex" ? "createdAt" : "updatedAt";
      params.KeyConditionExpression += ` AND ${dateKey} BETWEEN :startDate AND :endDate`;
      params.ExpressionAttributeValues![":startDate"] = startDate;
      params.ExpressionAttributeValues![":endDate"] = endDate;
    }

    const addFilterExpression = (key: string, value: any) => {
      const newKey = `#${key}`;
      const newAttrValue = `:${key}`;

      filterExpressions.push(`${newKey} = ${newAttrValue}`);
      params.ExpressionAttributeValues![newAttrValue] = value;
      params.ExpressionAttributeNames![newKey] = key;
    };

    if (status) addFilterExpression("status", status);

    if (rating) addFilterExpression("rating", rating);

    if (email) addFilterExpression("email", email);

    if (search) {
      const searchWords = search.split(/\s+/);
      if (searchWords.length > 0) {
        searchWords.forEach((word: string, index: number) => {
          const searchExpression = `contains(feedback_search, :search${index})`;
          filterExpressions.push(searchExpression);
          params.ExpressionAttributeValues![`:search${index}`] = word;
        });
      }
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
    }

    if (!Object.keys(params.ExpressionAttributeNames!).length) {
      params.ExpressionAttributeNames = undefined;
    }

    if (!Object.keys(params.ExpressionAttributeValues!).length) {
      params.ExpressionAttributeValues = undefined;
    }

    return params;
  }

  async update(reviewId: string, updateDto: UpdateClinicReviewDto) {
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

  async findOne(reviewId: string, options?: GetCommandOptions) {
    const params: GetCommandInput = {
      TableName,
      Key: { reviewId },
      ...options,
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new ClinicReviewEntity(Item) : null;
  }

  async findAllByClinic(clinicId: string, ProjectionExpression?: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "ClinicCreatedAtIndex",
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

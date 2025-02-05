import { GetCommand, QueryCommand, type QueryCommandInput, UpdateCommand, type UpdateCommandInput, paginateQuery } from "@aws-sdk/lib-dynamodb";

import type { GetCommandOptions, QueryCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { updateDataHelper } from "@/common/utils/update";

import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import type { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewEntity } from "./entity/review.entity";
import type { ReviewDto } from "./reviewModel";

const TableName = env.DYNAMODB_TBL_REVIEWS;

class ReviewRepository {
  async findAll(query: FindAllReviewDto, options?: QueryCommandOptions) {
    const { limit = 10, startingToken, ...filters } = query || {};

    const params = this.findAllQuery({ limit, ...filters }, options);

    // console.log("Query Command Params: ", JSON.stringify(params, null, 2));

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

    const reviews = accumulatedItems.map((item) => new ReviewEntity(item));

    return {
      lastEvaluatedKey: lastEvaluatedKey ?? null,
      total: reviews.length,
      data: reviews,
    };
  }

  async update(reviewId: string, updateDto: UpdateReviewDto) {
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(updateDto);

    const params: UpdateCommandInput = {
      TableName,
      Key: { reviewId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    // console.log("Update params:", JSON.stringify(params, null, 2));
    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new ReviewEntity(Attributes!);
  }

  private findAllQuery(filters: Omit<FindAllReviewDto, "startingToken">, options?: QueryCommandOptions) {
    const { search, limit, sort_by_date, startDate, endDate, schoolId, email, rating, status } = filters;

    const params: QueryCommandInput = {
      TableName,
      Limit: limit,
      ScanIndexForward: sort_by_date === "asc", // true for ascending, false for descending
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      ...options,
    };

    const filterExpressions: string[] = [];

    if (schoolId) {
      params.IndexName = "SchoolCreatedAtIndex";
      params.KeyConditionExpression = "schoolId = :schoolId";
      params.ExpressionAttributeValues![":schoolId"] = schoolId;
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
          const searchExpression = `(contains(best_things_search, :search${index}) OR contains(downsides_search, :search${index}) OR contains(email, :search${index}))`;
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

  async findManyBySchool(schoolId: string): Promise<ReviewDto[]> {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "SchoolCreatedAtIndex",
      KeyConditionExpression: "schoolId = :schoolId",
      ExpressionAttributeValues: {
        ":schoolId": schoolId,
      },
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    return Items!.map((item) => new ReviewEntity(item));
  }

  async findOne(reviewId: string, options?: GetCommandOptions) {
    const params = {
      TableName,
      Key: { reviewId },
      ...options,
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new ReviewEntity(Item) : null;
  }
}

export const reviewRepository = new ReviewRepository();

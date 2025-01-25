import { GetCommand, QueryCommand, type QueryCommandInput, paginateQuery } from "@aws-sdk/lib-dynamodb";

import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";

import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import { ReviewEntity } from "./entity/review.entity";
import type { ReviewDto } from "./reviewModel";

const TableName = env.DYNAMODB_TBL_REVIEWS;

class ReviewRepository {
  async findAll(query: FindAllReviewDto) {
    const { limit = 10, startingToken, ...filters } = query || {};

    const params = this.findAllQuery({ limit, ...filters });

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

    const reviews = accumulatedItems.map((item) => new ReviewEntity(item));

    return {
      lastEvaluatedKey: lastEvaluatedKey ?? null,
      total: reviews.length,
      data: reviews,
    };
  }

  private findAllQuery(filters: Omit<FindAllReviewDto, "startingToken">) {
    const { search, limit, sort_by_date, startDate, endDate, schoolId, userId, rating, status } = filters;

    const params: QueryCommandInput = {
      TableName,
      Limit: limit,
      ScanIndexForward: sort_by_date === "asc", // true for ascending, false for descending
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    const filterExpressions: string[] = [];

    if (schoolId) {
      params.IndexName = "SchoolCreatedAtIndex";
      params.KeyConditionExpression = "schoolId = :schoolId";
      params.ExpressionAttributeValues![":schoolId"] = schoolId;
    } else if (userId) {
      params.IndexName = "UserCreatedAtIndex";
      params.KeyConditionExpression = "userId = :userId";
      params.ExpressionAttributeValues![":userId"] = userId;
    } else {
      params.IndexName = "CreatedAtIndex";
      params.KeyConditionExpression = "#gsiKey = :gsiValue";
      params.ExpressionAttributeValues![":gsiValue"] = "ALL";
      params.ExpressionAttributeNames!["#gsiKey"] = "gsiPartitionKey";
    }

    if (startDate && endDate) {
      params.KeyConditionExpression += " AND createdAt BETWEEN :startDate AND :endDate";
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

    // TODO: Add search to params
    // if (search) {
    //   const searchWords = search.split(/\s+/);
    //   if (searchWords.length > 0) {
    //     searchWords.forEach((word: string, index: number) => {
    //       const searchExpression = `contains(#search, :search${index})`;
    //       filterExpressions.push(searchExpression);
    //       params.ExpressionAttributeNames!["#search"] = "search";
    //       params.ExpressionAttributeValues![`:search${index}`] = word;
    //     });
    //   }
    // }

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

  async findOne(reviewId: string) {
    const params = {
      TableName,
      Key: { reviewId },
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new ReviewEntity(Item) : null;
  }
}

export const reviewRepository = new ReviewRepository();

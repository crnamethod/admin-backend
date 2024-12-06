import {
  GetCommand,
  QueryCommand,
  type QueryCommandInput,
  type ScanCommandInput,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";

import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";

import type { FindAllReviewDto } from "./dto/get-all-review.dto";
import { ReviewEntity } from "./entity/review.entity";
import type { ReviewDto } from "./reviewModel";

const TableName = env.DYNAMODB_TBL_REVIEWS;

class ReviewRepository {
  async findAll(query: FindAllReviewDto) {
    const { limit = 10, startingToken } = query || {};

    const params: ScanCommandInput = {
      TableName,
      Limit: limit,
    };

    const paginator = paginateScan({ client: dynamoClient, startingToken }, params);

    const accumulatedItems: any[] = [];
    let lastEvaluatedKey: any;

    for await (const page of paginator) {
      accumulatedItems.push(...page.Items!);
      console.log(accumulatedItems.length);
      lastEvaluatedKey = page.LastEvaluatedKey;

      if (accumulatedItems.length >= limit) break;
    }

    const reviews = accumulatedItems.map((item) => new ReviewEntity(item));

    return {
      lastEvaluatedKey: lastEvaluatedKey ?? null,
      total: reviews.length,
      data: reviews,
    };
  }

  async findReviewsBySchoolIdAsync(schoolId: string): Promise<ReviewDto[]> {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "SchoolIdIndex",
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

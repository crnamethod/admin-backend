import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import {
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  type ScanCommandInput,
  UpdateItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { Review } from "./reviewModel";

const TableName = env.DYNAMODB_TBL_REVIEWS;

export const listReviews = async (
  lastReviewId?: string, // Review ID to start from (for pagination)
  limit = 10 // Number of items to return per page
): Promise<{ reviews: Review[]; lastEvaluatedKey?: string }> => {
  const params: ScanCommandInput = {
    TableName,
    Limit: limit, // Set the limit for pagination
  };

  // If lastReviewId is provided, set it as the ExclusiveStartKey for pagination
  if (lastReviewId) {
    params.ExclusiveStartKey = {
      reviewId: { S: lastReviewId }, // The key must be in DynamoDB attribute format
    };
  }

  try {
    // Scan the DynamoDB table
    const { Items, LastEvaluatedKey } = await dynamoClient.send(
      new ScanCommand(params)
    );

    if (!Items) return { reviews: [] };

    // Unmarshall and return the items as reviews
    const reviews: Review[] = Items.map((item) => {
      const reviewData = unmarshall(item);
      return reviewData as Review;
    });

    // Extract the last reviewId if there's more data to retrieve
    const lastEvaluatedReviewId = LastEvaluatedKey
      ? LastEvaluatedKey.reviewId?.S
      : undefined;

    return { reviews, lastEvaluatedKey: lastEvaluatedReviewId };
  } catch (error) {
    console.error("Error scanning reviews:", error);
    throw new Error("Could not retrieve reviews information");
  }
};

export const listReview = async (reviewId: string) => {
  const params = {
    TableName: TableName,
    Key: {
      reviewId: { S: reviewId },
    },
  };

  try {
    const { Item } = await dynamoClient.send(new GetItemCommand(params));
    if (!Item) return null;

    const review = unmarshall(Item);

    return review;
  } catch (error) {
    console.error("Error fetching review by ID:", error);
    throw new Error("Could not retrieve review information");
  }
};

export const ReviewPerSchool = async (schoolId: string) => {
  const params = {
    TableName: TableName,
    FilterExpression: "#schoolId = :schoolId",
    ExpressionAttributeNames: {
      "#schoolId": "schoolId",
    },
    ExpressionAttributeValues: {
      ":schoolId": { S: schoolId },
    },
  };

  try {
    const { Items } = await dynamoClient.send(new ScanCommand(params));
    if (!Items) return null;

    const reviews = Items.map((item) => unmarshall(item) as Review);

    return reviews;
  } catch (error) {
    console.error("Error fetching review by school id:", error);
    throw new Error("Could not retrieve review information");
  }
};

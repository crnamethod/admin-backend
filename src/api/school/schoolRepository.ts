import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { GetItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { type School, SchoolSchema } from "./schoolModel";

const TableName = env.DYNAMODB_TBL_SCHOOLS;

export const listSchools = async (): Promise<School[] | []> => {
  const params: any = {
    TableName,
    // Limit: 1,
  };

  try {
    // Scan the DynamoDB table
    const { Items } = await dynamoClient.send(new ScanCommand(params));

    if (!Items) return [];

    const schools: School[] = Items.map((item) => {
      const schoolData = unmarshall(item);
      return schoolData as School;
    });

    return schools || [];
  } catch (error) {
    console.error("Error scanning schools:", error);
    throw new Error("Could not retrieve schools information");
  }
};

export const listSchool = async (schoolId: string): Promise<School | null> => {
  const params = {
    TableName: TableName,
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id", // Mapping for the partition key
    },
    ExpressionAttributeValues: {
      ":id": { S: schoolId }, // Partition key value
    },
    Limit: 1, // Limit query to return only the first matching item
  };

  try {
    const { Items } = await dynamoClient.send(new QueryCommand(params));
    if (!Items || Items.length === 0) return null;

    const item = unmarshall(Items[0]);
    const schoolData = item as School;

    return schoolData;
  } catch (error) {
    console.error("Error fetching school by ID:", error);
    throw new Error("Could not retrieve school information");
  }
};

export const updateSchool = async (id: string, name: string, updates: any) => {
  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: any = {};
  const expressionAttributeValues: any = {};

  Object.keys(updates).forEach((key, index) => {
    const attributeNames = key.split(".").map((part, i) => `#attr${index}_${i}`);
    const attributePath = attributeNames.join(".");
    const valueKey = `:val${index}`;

    updateExpressionParts.push(`${attributePath} = ${valueKey}`);

    key.split(".").forEach((part, i) => {
      expressionAttributeNames[attributeNames[i]] = part;
    });

    expressionAttributeValues[valueKey] = updates[key];
  });

  const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

  const params: any = {
    TableName,
    Key: { id, name },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  try {
    console.log("Update params:", JSON.stringify(params, null, 2)); // Log params for debugging
    const command = new UpdateCommand(params);
    const data = await dynamoClient.send(command);
    return data.Attributes;
  } catch (error: any) {
    console.error("Update error:", error);
    throw new Error(`Failed to update school with id ${id} and name ${name}: ${error.message}`);
  }
};

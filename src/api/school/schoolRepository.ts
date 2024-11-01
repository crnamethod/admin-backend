import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { QueryCommand, ScanCommand, type ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand, type UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { UpdateSchoolDto } from "./dto/update-school.dto";
import type { School } from "./schoolModel";

const TableName = env.DYNAMODB_TBL_SCHOOLS;

export const listSchool = async (schoolId: string): Promise<School | null> => {
  const params = {
    TableName: TableName,
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":id": { S: schoolId },
    },
  };

  try {
    const { Items } = await dynamoClient.send(new QueryCommand(params));
    if (!Items || Items.length === 0) return null;

    const schoolData = unmarshall(Items[0]) as School;
    return schoolData;
  } catch (error) {
    console.error("Error fetching school by ID:", error);
    throw new Error("Could not retrieve school information");
  }
};

export const updateSchool = async (
  id: string,
  name: string,
  updates: Partial<Omit<UpdateSchoolDto, "id" | "name" | "clinicIds">>,
) => {
  // Flatten nested objects into dot notation
  const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
    return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
      const prefixKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], prefixKey));
      } else {
        acc[prefixKey] = obj[key];
      }
      return acc;
    }, {});
  };

  const flattenedUpdates = flattenObject(updates);

  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(flattenedUpdates).forEach(([key, value], index) => {
    if (value === undefined) return;

    const parts = key.split(".");
    const attributeNames = parts.map((_, i) => `#key${index}_${i}`);
    const attributePath = attributeNames.join(".");
    const valueKey = `:val${index}`;

    updateExpressionParts.push(`${attributePath} = ${valueKey}`);

    // Set each part of the nested path in ExpressionAttributeNames
    parts.forEach((part, i) => {
      expressionAttributeNames[attributeNames[i]] = part;
    });

    expressionAttributeValues[valueKey] = value;
  });

  if (updateExpressionParts.length === 0) {
    throw new Error("No valid updates provided");
  }

  const params: UpdateCommandInput = {
    TableName,
    Key: {
      id,
      name,
    },
    UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  try {
    console.log("Update params:", JSON.stringify(params, null, 2));
    const command = new UpdateCommand(params);
    const result = await dynamoClient.send(command);
    return result.Attributes;
  } catch (error: any) {
    console.error("Update error:", error);
    throw new Error(`Failed to update school: ${error.message}`);
  }
};

export const listSchools = async (
  name?: string,
  lastSchoolId?: string,
  limit = 10,
): Promise<{ schools: School[]; lastEvaluatedId?: string; lastEvaluatedName?: string }> => {
  const params: ScanCommandInput = {
    TableName,
    Limit: limit,
  };

  if (lastSchoolId && name) {
    params.ExclusiveStartKey = {
      id: { S: lastSchoolId },
      name: { S: name },
    };
  }

  try {
    const { Items, LastEvaluatedKey } = await dynamoClient.send(new ScanCommand(params));

    if (!Items) return { schools: [] };

    const schools = Items.map((item) => unmarshall(item) as School);

    return {
      schools,
      lastEvaluatedId: LastEvaluatedKey?.id?.S,
      lastEvaluatedName: LastEvaluatedKey?.name?.S,
    };
  } catch (error) {
    console.error("Error scanning schools:", error);
    throw new Error("Could not retrieve schools information");
  }
};

export const createSchool = async (school: School) => {
  const params = {
    TableName,
    Item: school,
    ConditionExpression: "attribute_not_exists(id) AND attribute_not_exists(#name)",
    ExpressionAttributeNames: {
      "#name": "name",
    },
  };

  try {
    const command = new PutCommand(params);
    const data = await dynamoClient.send(command);
    return data;
  } catch (error: any) {
    console.error("Create error:", error);
    throw new Error(`Failed to create school: ${error.message}`);
  }
};

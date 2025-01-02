import { UpdateCommand, type UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { nowISO } from "./date";
import { dynamoClient } from "./dynamo";

export const updateDataHelper = (updateDto: any) => {
  const updateExpressionParts: string[] = [];
  const expressionAttributeNames: any = {};
  const expressionAttributeValues: any = {};

  updateExpressionParts.push("updatedAt = :updatedAt");
  expressionAttributeValues[":updatedAt"] = nowISO();

  Object.entries(updateDto).forEach(([key, value]) => {
    const attributeName = `#${key}`;
    const valueKey = `:${key}`;

    updateExpressionParts.push(`${attributeName} = ${valueKey}`);

    expressionAttributeNames[attributeName] = key;

    expressionAttributeValues[valueKey] = value;
  });

  const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

  return { updateExpression, expressionAttributeValues, expressionAttributeNames };
};

export const chunkObject = (obj: Record<string, any>, chunkSize: number) => {
  const chunks: Record<string, any>[] = [];
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk: Record<string, any> = {};
    keys.slice(i, i + chunkSize).forEach((key) => {
      chunk[key] = obj[key];
    });
    chunks.push(chunk);
  }

  return chunks;
};

export const updateParentUpdatedAt = async (TableName: string, Key: Record<string, any>) => {
  // ? Update School's updatedAt property
  const parentParams: UpdateCommandInput = {
    TableName,
    Key,
    UpdateExpression: "SET updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":updatedAt": nowISO(),
    },
  };

  await dynamoClient.send(new UpdateCommand(parentParams));
};

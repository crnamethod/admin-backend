import { nowISO } from "./date";

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

/* eslint-disable no-undef */
import {
  DescribeTableCommand,
  type DescribeTableCommandInput,
  type DescribeTableCommandOutput,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
import { env } from "@/common/utils/envConfig";

// Configure AWS SDK with environment variables
export const clientConfig = {
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.AWS_DEFAULT_REGION,
};

const dynamoClient = new DynamoDBClient(clientConfig);
const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

interface TableInfo {
  Table: DescribeTableCommandOutput["Table"];
}

const getTableInfo = async (tableName: string): Promise<TableInfo | void> => {
  const params: DescribeTableCommandInput = {
    TableName: tableName,
  };

  try {
    const data = await dynamoClient.send(new DescribeTableCommand(params));

    return { Table: data.Table } as TableInfo;
  } catch (error) {
    console.error("Error getting table info:", error);
  }
};

export { dynamoDocClient as dynamoClient, getTableInfo };

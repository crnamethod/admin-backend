import type { KeysAndAttributes } from "@aws-sdk/client-dynamodb";
import type { GetCommandInput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

export type BatchGetCommandOptions = Omit<KeysAndAttributes, "Keys">;
export type GetCommandOptions = Omit<GetCommandInput, "TableName" | "Key">;
export type QueryCommandOptions = Omit<QueryCommandInput, "TableName" | "IndexName">;

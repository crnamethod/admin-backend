import {
  BatchGetCommand,
  type BatchGetCommandInput,
  GetCommand,
  type GetCommandInput,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
  ScanCommand,
  type ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

import type { BatchGetCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";

import type { CreatePrerequisiteDto } from "../dto/create-prerequisite.dto";
import { PrerequisiteEntity } from "../entities/prerequisite.entity";

const TableName = env.DYNAMODB_TBL_PREREQUISITES;

class PrerequisiteRepository {
  async create(dto: CreatePrerequisiteDto) {
    const newPrerequisiteEntity = new PrerequisiteEntity(dto, { existing: false });

    const params: PutCommandInput = {
      TableName,
      Item: newPrerequisiteEntity,
    };

    await dynamoClient.send(new PutCommand(params));

    return newPrerequisiteEntity;
  }

  async findOne(prerequisiteId: string) {
    const params: GetCommandInput = {
      TableName,
      Key: { prerequisiteId },
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new PrerequisiteEntity(Item) : null;
  }

  async findOneByName(name: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "NameIndex",
      KeyConditionExpression: "#name = :name",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": name,
      },
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    return Items && Items.length > 0 ? new PrerequisiteEntity(Items[0]) : null;
  }

  async findAll() {
    const params: ScanCommandInput = {
      TableName,
    };

    const { Items } = await dynamoClient.send(new ScanCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new PrerequisiteEntity(item));

    return [];
  }

  async findAllByIds(prerequisiteIds: string[], options?: BatchGetCommandOptions) {
    if (prerequisiteIds.length === 0) return [];

    const Keys = prerequisiteIds.map((prerequisiteId) => ({ prerequisiteId }));
    const { ProjectionExpression, ExpressionAttributeNames } = options || {};

    const params: BatchGetCommandInput = {
      RequestItems: {
        [`${TableName}`]: {
          Keys,
          ...(options?.ProjectionExpression && {
            ProjectionExpression,
            ExpressionAttributeNames,
          }),
        },
      },
    };

    const { Responses } = await dynamoClient.send(new BatchGetCommand(params));

    const DevPrerequisite = (Responses?.[`${TableName}`] as PrerequisiteEntity[]) || [];

    return DevPrerequisite;
  }
}

export const prerequisiteRepository = new PrerequisiteRepository();

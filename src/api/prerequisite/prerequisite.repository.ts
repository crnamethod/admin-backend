import { PutCommand, type PutCommandInput, QueryCommand, type QueryCommandInput } from "@aws-sdk/lib-dynamodb";

import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";

import type { CreatePrerequisiteDto } from "./dto/create-prerequisite.dto";
import { PrerequisiteSchoolEntity } from "./entities/prerequisite-school.entity";
import { PrerequisiteEntity } from "./entities/prerequisite.entity";

const TableName = env.DYNAMODB_TBL_PREREQUISITE_SCHOOLS;

class PrerequisiteRepository {
  async create(dto: CreatePrerequisiteDto) {
    const newPrerequisite = new PrerequisiteEntity(dto, { existing: false });

    const params: PutCommandInput = {
      TableName,
      Item: newPrerequisite,
    };

    await dynamoClient.send(new PutCommand(params));

    return newPrerequisite;
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

  async findAllBySchool(schoolId: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "SchoolPrerequisiteIndex",
      KeyConditionExpression: "schoolId = :schoolId",
      ExpressionAttributeValues: {
        ":schoolId": schoolId,
      },
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new PrerequisiteSchoolEntity(item));

    return [];
  }
}

export const prerequisiteRepository = new PrerequisiteRepository();

import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  GetCommand,
  type GetCommandInput,
  QueryCommand,
  type QueryCommandInput,
  ScanCommand,
  type ScanCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { updateDataHelper } from "@/common/utils/update";

import type { CreatePrerequisiteSchoolDto } from "../dto/create-prerequisite-school.dto";
import type { FindPrerequisiteSchoolDto } from "../dto/get-prerequisite-school.dto";
import type { UpdatePrerequisiteSchoolDto } from "../dto/update-prerequisite-school.dto";
import { PrerequisiteSchoolEntity } from "../entities/prerequisite-school.entity";

const TableName = env.DYNAMODB_TBL_PREREQUISITE_SCHOOLS;

class PrerequisiteSchoolRepository {
  async create(createDto: CreatePrerequisiteSchoolDto) {
    const { schoolId, prerequisites } = createDto;

    const prerequisiteSchoolEntities: PrerequisiteSchoolEntity[] = [];

    const prereqSchoolItems = prerequisites.map((prerequisite) => {
      prerequisiteSchoolEntities.push(new PrerequisiteSchoolEntity({ schoolId, ...prerequisite }));

      return {
        PutRequest: {
          Item: new PrerequisiteSchoolEntity({ schoolId, ...prerequisite }),
        },
      };
    });

    const params: BatchWriteCommandInput = {
      RequestItems: {
        [TableName]: prereqSchoolItems,
      },
    };

    // ? Create new Prerequisite
    await dynamoClient.send(new BatchWriteCommand(params));

    return prerequisiteSchoolEntities;
  }

  async update(Key: FindPrerequisiteSchoolDto, updateDto: UpdatePrerequisiteSchoolDto) {
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(updateDto);

    const params: UpdateCommandInput = {
      TableName,
      Key,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new PrerequisiteSchoolEntity(Attributes!);
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

  async findAll() {
    const params: ScanCommandInput = {
      TableName,
    };

    const { Items } = await dynamoClient.send(new ScanCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new PrerequisiteSchoolEntity(item));

    return [];
  }

  async findOne(prerequisiteId: string, schoolId: string, options?: GetCommandOptions) {
    const params: GetCommandInput = {
      TableName,
      Key: { prerequisiteId, schoolId },
      ...options,
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new PrerequisiteSchoolEntity(Item) : null;
  }

  async remove(schoolId: string, prerequisiteIds: string[]) {
    const prereqSchoolItems = prerequisiteIds.map((prerequisiteId) => ({
      DeleteRequest: {
        Key: { schoolId, prerequisiteId },
      },
    }));

    const params: BatchWriteCommandInput = {
      RequestItems: {
        [TableName]: prereqSchoolItems,
      },
    };

    // ? Create new Prerequisite
    await dynamoClient.send(new BatchWriteCommand(params));
  }

  async findAllById(prerequisiteId: string) {
    const params: QueryCommandInput = {
      TableName,
      KeyConditionExpression: "prerequisiteId = :prerequisiteId",
      ExpressionAttributeValues: {
        ":prerequisiteId": prerequisiteId,
      },
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new PrerequisiteSchoolEntity(item));

    return [];
  }

  async updateMany(prerequisiteId: string, updateDto: UpdatePrerequisiteSchoolDto) {
    const existing_prerequisite_schools = await this.findAllById(prerequisiteId);

    const BATCH_SIZE = 20;
    const updatedItems: PrerequisiteSchoolEntity[] = [];

    for (let i = 0; i < existing_prerequisite_schools.length; i += BATCH_SIZE) {
      const batch = existing_prerequisite_schools.slice(i, i + BATCH_SIZE);

      const prereqSchools = batch.map((prerequisite) => {
        if (updateDto.label) prerequisite.label = updateDto.label;

        const params = {
          PutRequest: {
            Item: prerequisite,
          },
        };

        updatedItems.push(prerequisite);

        return params;
      });

      const params: BatchWriteCommandInput = {
        RequestItems: {
          [TableName]: prereqSchools,
        },
      };

      await dynamoClient.send(new BatchWriteCommand(params));

      // console.log(`${i} out of ${existing_prerequisite_schools.length}`);
      // break;
    }
  }

  // async updateAll() {
  //   const existing_prerequisite_schools = await this.findAll();
  //   const existing_prereq = await prerequisiteRepository.findAll();

  //   const BATCH_SIZE = 20;
  //   const updatedItems: any[] = [];

  //   for (let i = 0; i < existing_prerequisite_schools.length; i += BATCH_SIZE) {
  //     const batch = existing_prerequisite_schools.slice(i, i + BATCH_SIZE);

  //     const prereqSchools = batch.map((prerequisite) => {
  //       if (!prerequisite.label) {
  //         const foundPrereq = existing_prereq.find((existing) => existing.prerequisiteId === prerequisite.prerequisiteId);

  //         if (foundPrereq) prerequisite.label = foundPrereq.label;
  //       }

  //       const params = {
  //         PutRequest: {
  //           Item: prerequisite,
  //         },
  //       };

  //       updatedItems.push(prerequisite);

  //       return params;
  //     });

  //     const params: BatchWriteCommandInput = {
  //       RequestItems: {
  //         [TableName]: prereqSchools,
  //       },
  //     };

  //     await dynamoClient.send(new BatchWriteCommand(params));

  //     console.log(`${i} out of ${existing_prerequisite_schools.length}`);
  //     // break;
  //   }

  //   return { count: updatedItems.length, updatedItems };
  // }
}

export const prerequisiteSchoolRepository = new PrerequisiteSchoolRepository();

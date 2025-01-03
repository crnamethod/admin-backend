import {
  BatchGetCommand,
  type BatchGetCommandInput,
  DeleteCommand,
  type DeleteCommandInput,
  GetCommand,
  type GetCommandInput,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
  type ScanCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";

import type { BatchGetCommandOptions } from "@/common/types/dynamo-options.type";
import { nowISO } from "@/common/utils/date";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { HttpException } from "@/common/utils/http-exception";
import { updateDataHelper } from "@/common/utils/update";

import { FetchEnum } from "../school/dto/filter-school.dto";
import type { CreateClinicDto } from "./dto/create-clinic.dto";
import type { FindAllClinicDto } from "./dto/get-all-clinic.dto";
import type { UpdateClinicDto } from "./dto/update-clinic.dto";
import { ClinicEntity } from "./entity/clinic.entity";

const TableName = env.DYNAMODB_TBL_CLINICS;

class ClinicRepository {
  async create(createClinicDto: CreateClinicDto) {
    // ? Create a new instance for a Clinic
    const newClinicInstance = new ClinicEntity(createClinicDto, { existing: false });

    const params: PutCommandInput = {
      TableName,
      Item: newClinicInstance,
    };

    // ? Create a new Clinic
    await dynamoClient.send(new PutCommand(params));

    return newClinicInstance;
  }

  async update(clinicId: string, updateDto: UpdateClinicDto) {
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(updateDto);

    const params: UpdateCommandInput = {
      TableName,
      Key: { clinicId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    try {
      // console.log('Update params:', JSON.stringify(params, null, 2)); // Log params for debugging

      const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

      return new ClinicEntity(Attributes!);
    } catch (error: any) {
      throw new HttpException(`Failed to update clinic with id ${clinicId}: ${error.message}`, 400);
    }
  }

  async findAll(query: FindAllClinicDto) {
    const { fetch = FetchEnum.NO_TRASH, limit = 10, startingToken } = query || {};

    const filterExpressions: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = {};

    if (fetch === FetchEnum.NO_TRASH) {
      filterExpressions.push("(attribute_not_exists(deletedAt) OR deletedAt = :deletedAt)");
      expressionAttributeValues[":deletedAt"] = null;
    } else if (fetch === FetchEnum.TRASH_ONLY) {
      filterExpressions.push("(attribute_exists(deletedAt) AND deletedAt <> :deletedAt)");
      expressionAttributeValues[":deletedAt"] = null;
    }

    const params: ScanCommandInput = {
      TableName,
      Limit: limit,
    };

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
    }
    if (Object.keys(expressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const paginator = paginateScan({ client: dynamoClient, startingToken }, params);

    const accumulatedItems: any[] = [];
    let lastEvaluatedKey: any;

    for await (const page of paginator) {
      accumulatedItems.push(...page.Items!);
      lastEvaluatedKey = page.LastEvaluatedKey;

      if (accumulatedItems.length >= limit) break;
    }

    const clinics = accumulatedItems.map((item) => new ClinicEntity(item));

    return {
      lastEvaluatedKey: lastEvaluatedKey ?? null,
      total: clinics.length,
      data: clinics,
    };
  }

  async findAllByIds(clinicIds: string[], options?: BatchGetCommandOptions) {
    const Keys = clinicIds.map((clinicId) => ({ clinicId }));
    const { ProjectionExpression, ExpressionAttributeNames } = options || {};

    const params: BatchGetCommandInput = {
      RequestItems: {
        [TableName]: {
          Keys,
          ...(options?.ProjectionExpression && {
            ProjectionExpression,
            ExpressionAttributeNames,
          }),
        },
      },
    };

    const { Responses } = await dynamoClient.send(new BatchGetCommand(params));

    const DevClinics = (Responses?.[TableName] as ClinicEntity[]) || [];

    return DevClinics.sort((a, b) => a.name.localeCompare(b.name)).filter((c) => !c.deletedAt);
  }

  async findOne(clinicId: string) {
    const params: GetCommandInput = {
      TableName,
      Key: { clinicId },
      ProjectionExpression: "#name, address, latitude, longitude",
      ExpressionAttributeNames: {
        "#name": "name",
      },
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new ClinicEntity(Item) : null;
  }

  async findByNameAndAddress(name: string, address: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "NameAddressIndex",
      KeyConditionExpression: "#name = :name AND #address = :address",
      ExpressionAttributeNames: {
        "#name": "name",
        "#address": "address",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":address": address,
      },
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) {
      return new ClinicEntity(Items[0]);
    }

    return null;
  }

  async softDelete(clinicId: string) {
    const params: UpdateCommandInput = {
      TableName,
      Key: { clinicId },
      UpdateExpression: "SET deletedAt = :deletedAt",
      ExpressionAttributeValues: {
        ":deletedAt": nowISO(),
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new ClinicEntity(Attributes!);
  }

  async restore(clinicId: string) {
    const params: UpdateCommandInput = {
      TableName,
      Key: { clinicId },
      UpdateExpression: "SET deletedAt = :deletedAt",
      ExpressionAttributeValues: {
        ":deletedAt": null,
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new ClinicEntity(Attributes!);
  }

  async forceRemove(clinicId: string) {
    const params: DeleteCommandInput = {
      TableName,
      Key: { clinicId },
    };

    await dynamoClient.send(new DeleteCommand(params));
  }
}

export const clinicRepository = new ClinicRepository();

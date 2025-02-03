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
  UpdateCommand,
  type UpdateCommandInput,
  paginateQuery,
} from "@aws-sdk/lib-dynamodb";

import type { BatchGetCommandOptions, GetCommandOptions } from "@/common/types/dynamo-options.type";
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
    const { fetch = FetchEnum.NO_TRASH, limit = 500, search, sort = "asc", startingToken } = query || {};

    const filterExpressions: string[] = [];

    const expressionAttributeNames: { [key: string]: string } = {
      "#gsiKey": "gsiPartitionKey",
    };

    const expressionAttributeValues: { [key: string]: any } = {
      ":gsiValue": "ALL",
    };

    if (fetch === FetchEnum.NO_TRASH) {
      filterExpressions.push("(attribute_not_exists(deletedAt) OR deletedAt = :deletedAt)");
      expressionAttributeValues[":deletedAt"] = null;
    } else if (fetch === FetchEnum.TRASH_ONLY) {
      filterExpressions.push("(attribute_exists(deletedAt) AND deletedAt <> :deletedAt)");
      expressionAttributeValues[":deletedAt"] = null;
    }

    const params: QueryCommandInput = {
      TableName,
      IndexName: "NameIndex",
      KeyConditionExpression: "#gsiKey = :gsiValue",
      ScanIndexForward: sort === "asc", // true for ascending, false for descending
      Limit: search && !limit ? 1000 : limit,
    };

    // ? Add search to params
    if (search) {
      const searchWords = search.split(/\s+/);
      if (searchWords.length > 0) {
        searchWords.forEach((word: string, index: number) => {
          const searchExpression = `contains(#search, :search${index})`;
          filterExpressions.push(searchExpression);
          expressionAttributeNames["#search"] = "search";
          expressionAttributeValues[`:search${index}`] = word;
        });
      }
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
    }
    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }
    if (Object.keys(expressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    console.log("Query Command Params: ", JSON.stringify(params, null, 2));

    const paginator = paginateQuery({ client: dynamoClient, startingToken }, params);

    const accumulatedItems: any[] = [];
    let lastEvaluatedKey: any;

    for await (const page of paginator) {
      const remainingLimit = limit - accumulatedItems.length;
      accumulatedItems.push(...page.Items!.slice(0, remainingLimit));

      // ? If the accumulated items length is exactly the same with the limit
      if (remainingLimit % limit === 0 && accumulatedItems.length >= limit) {
        lastEvaluatedKey = page.LastEvaluatedKey;
        break;
      } else if (accumulatedItems.length >= limit) {
        break;
      }

      // ? Reassign the value for the last evaluated key if there's still remaining items to be pushed
      lastEvaluatedKey = page.LastEvaluatedKey;
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

  async findOne(clinicId: string, options?: GetCommandOptions) {
    const params: GetCommandInput = {
      TableName,
      Key: { clinicId },
      ProjectionExpression: "#name, address, latitude, longitude",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ...options,
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

    return Items && Items.length > 0 ? new ClinicEntity(Items[0]) : null;
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

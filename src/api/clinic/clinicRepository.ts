import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import {
  ScanCommand,
  UpdateItemCommand,
  ScanCommandInput,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ClinicType } from "./clinicModel";
import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { ClinicEntity } from "./entity/clinic.entity";

const TableName = env.DYNAMODB_TBL_CLINICS;

export const clinicRepository = {
  findAll: async (
    clinicId?: string,
    limit = 10
  ): Promise<{ clinics: ClinicType[]; lastClinicId?: string } | []> => {
    const params: ScanCommandInput = {
      TableName,
      Limit: limit,
    };

    if (clinicId) {
      params.ExclusiveStartKey = {
        clinicId: { S: clinicId },
      };
    }
    try {
      const { Items, LastEvaluatedKey } = await dynamoClient.send(
        new ScanCommand(params)
      );

      if (!Items || Items.length === 0) return [];

      const clinics: ClinicType[] = Items.map(
        (item) => unmarshall(item) as ClinicType
      );

      const lastClinicId = LastEvaluatedKey
        ? LastEvaluatedKey.clinicId?.S
        : undefined;

      return {
        clinics,
        lastClinicId,
      };
    } catch (error) {
      console.error("Error scanning clinics:", error);
      throw new Error("Could not retrieve clinics information");
    }
  },

  findOne: async (clinicId: string) => {
    const Item = await findOneQuery(clinicId);

    if (!Item) return null;

    return Item;
  },

  updateClinic: async (
    clinicId: string,
    clinicUpdates: Partial<ClinicType>
  ): Promise<ClinicType> => {
    const now = new Date().toISOString();

    // if (clinicUpdates.name) {
    //   const nameExists = await findByClinicAndName(clinicId, clinicUpdates.name);
    //   if (nameExists && nameExists.clinicId === clinicId) {
    //     throw new Error("name already exists");
    //   }
    // }

    let updateExpression = "set updatedAt = :updatedAt, ";
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {
      ":updatedAt": { S: now },
    };

    for (const [key, value] of Object.entries(clinicUpdates)) {
      updateExpression += `#${key} = :${key}, `;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = { S: value };
    }

    const params: any = {
      TableName: TableName,
      Key: {
        clinicId: { S: clinicId },
      },
      UpdateExpression: updateExpression.slice(0, -2),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    try {
      const { Attributes }: any = await dynamoClient.send(
        new UpdateItemCommand(params)
      );

      const user = unmarshall(Attributes) as ClinicType;
      return user;
    } catch (error) {
      console.error("Error updating clinic profile:", error);
      throw new Error("Could not update clinic profile");
    }
  },
  create: async (createClinicDto: CreateClinicDto) => {
    // ? Create a new instance for a Clinic
    const newClinicInstance = new ClinicEntity(createClinicDto, false);

    const params: PutCommandInput = {
      TableName,
      Item: newClinicInstance,
    };

    // ? Create a new Clinic
    await dynamoClient.send(new PutCommand(params));

    return newClinicInstance;
  },

  findByNameAndAddress: async (name: string, address: string) => {
    const Items = await findByNameAndAddressQuery(name, address);

    if (Items && Items.length > 0) {
      return new ClinicEntity(Items[0]);
    }

    return null;
  },
};

const findOneQuery = async (clinicId: string) => {
  const params: GetCommandInput = {
    TableName,
    Key: { clinicId },
    ProjectionExpression: `#name, address, latitude, longitude`,
    ExpressionAttributeNames: {
      "#name": "name",
    },
  };

  const { Item } = await dynamoClient.send(new GetCommand(params));

  return Item;
};

const findByClinicAndName = async (clinicId: string, name: string) => {
  const params = {
    TableName,
    KeyConditionExpression: "clinicId = :clinicId",
    FilterExpression: "#name = :name", // Use FilterExpression for non-key attributes
    ExpressionAttributeNames: {
      "#name": "name", // Using # to avoid reserved keywords
    },
    ExpressionAttributeValues: {
      ":clinicId": { S: clinicId }, // Use { S: value } for strings
      ":name": { S: name }, // Use { S: value } for strings
    },
  };

  try {
    const { Items } = await dynamoClient.send(new QueryCommand(params));
    if (!Items || Items.length === 0) {
      return null;
    }

    const Item = unmarshall(Items[0]);
    return Item;
  } catch (error) {
    console.error("Error fetching clinic by name:", error);
    throw new Error("Could not fetch clinic by name");
  }
};

const findByNameAndAddressQuery = async (name: string, address: string) => {
  const params: QueryCommandInput = {
    TableName,
    IndexName: "NameAddressIndex",
    KeyConditionExpression: "#name = :name AND #address = :address",
    ExpressionAttributeNames: {
      "#name": "name",
      "#address": "address",
    },
    ExpressionAttributeValues: {
      ":name": { S: name }, // { S: value } for String
      ":address": { S: address }, // { S: value } for String
    },
  };

  const { Items } = await dynamoClient.send(new QueryCommand(params));
  return Items;
};

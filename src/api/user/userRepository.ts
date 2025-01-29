import { GetCommand, QueryCommand, type QueryCommandInput, ScanCommand, UpdateCommand, type UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

import type { UserProfile } from "@/api/user/userModel";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { updateDataHelper } from "@/common/utils/update";

import type { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserEntity } from "./entity/user.entity";

const TableName = env.DYNAMODB_TBL_USERPROFILE;

export class UserRepository {
  async getAllUsers(): Promise<UserProfile[]> {
    const params = {
      TableName,
    };

    const { Items } = await dynamoClient.send(new ScanCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new UserEntity(item));

    return [];
  }

  async findOne(userId: string, options?: GetCommandOptions): Promise<UserProfile | null> {
    const params = {
      TableName,
      Key: { userId },
      ...options,
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    return Item ? new UserEntity(Item) : null;
  }

  async update(userId: string, updateDto: UpdateProfileDto) {
    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(updateDto);

    const params: UpdateCommandInput = {
      TableName,
      Key: { userId },
      UpdateExpression: updateExpression.slice(0, -2), // ? Remove the trailing comma and space
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new UserEntity(Attributes);
  }

  async findOneByUsername(username: string) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "UsernameCreatedAtIndex",
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": username,
      },
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    return Items && Items.length > 0 ? new UserEntity(Items[0]) : null;
  }
}

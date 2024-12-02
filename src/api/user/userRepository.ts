import {
  GetCommand,
  PutCommand,
  type PutCommandInput,
  type PutCommandOutput,
  ScanCommand,
  UpdateCommand,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

import type { UserProfile } from "@/api/user/userModel";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { nowISO } from "@/common/utils/date";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { updateDataHelper } from "@/common/utils/update";
import type { CreateUserProfileDto } from "./dto/create-user.dto";
import { UserEntity } from "./entity/user.entity";

const TableName = env.DYNAMODB_TBL_USERPROFILE;

export class UserRepository {
  async getAllUsers(): Promise<UserProfile[]> {
    const params = {
      TableName,
    };

    const { Items } = await dynamoClient.send(new ScanCommand(params));

    if (Items && Items.length > 0) Items.map((item) => new UserEntity(item));

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

  async updateProfileAsync(userId: string, profileUpdates: Partial<UserProfile>): Promise<UserProfile> {
    if (profileUpdates.username) {
      const usernameExists = await this.findProfileByUsernameAsync(profileUpdates.username);

      if (usernameExists && usernameExists.userId !== userId) {
        throw new Error("Username already exists");
      }
    }

    const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(profileUpdates);

    const params: UpdateCommandInput = {
      TableName,
      Key: { userId },
      UpdateExpression: updateExpression.slice(0, -2), // ? Remove the trailing comma and space
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    try {
      const { Attributes } = await dynamoClient.send(new UpdateCommand(params));
      return Attributes as UserProfile;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Could not update user profile");
    }
  }

  async findProfileByUsernameAsync(username: string): Promise<UserProfile | null> {
    const params = {
      TableName,
      FilterExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": username,
      },
    };

    try {
      const { Items } = await dynamoClient.send(new ScanCommand(params));

      if (!Items || Items.length === 0) {
        return null;
      }

      return new UserEntity(Items[0]);
    } catch (error) {
      console.error("Error fetching user profile by username:", error);
      throw new Error("Could not fetch user profile by username");
    }
  }

  async createProfileAsync(profile: CreateUserProfileDto): Promise<PutCommandOutput | UserProfile> {
    const getParams = {
      TableName,
      Key: { userId: profile.userId },
    };

    try {
      const { Item } = await dynamoClient.send(new GetCommand(getParams));

      if (Item) {
        // Profile already exists, return the existing profile
        return new UserEntity(Item);
      } else {
        const Item = {
          userId: profile.userId,
          email: profile.email,
          stripeCustomerId: "",
          isSubscriber: false,
          username: "",
          firstName: "",
          lastName: "",
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };

        // Profile does not exist, create a new profile
        const putParams: PutCommandInput = {
          TableName,
          Item,
        };

        const { Attributes } = await dynamoClient.send(new PutCommand(putParams));

        // Construct and return the profile object
        return new UserEntity(Attributes);
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw new Error("Could not create user profile");
    }
  }
}

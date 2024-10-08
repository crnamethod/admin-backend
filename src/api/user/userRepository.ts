import type { User, UserProfile } from "@/api/user/userModel";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import {
  GetItemCommand,
  PutItemCommand,
  type PutItemCommandOutput,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const TableName = env.DYNAMODB_TBL_USERPROFILE;

export class UserRepository {
  async getAllUsers(): Promise<UserProfile[]> {
    const params = {
      TableName: TableName,
    };

    const { Items } = await dynamoClient.send(new ScanCommand(params));
    if (Items) {
      const users: UserProfile[] = Items.map((item) => {
        return {
          userId: String(item.userId.S),
          email: String(item.email.S),
          stripeCustomerId: item.stripeCustomerId?.S,
          isSubscriber: item.isSubscriber.BOOL,
          createdAt: item.createdAt?.S ? new Date(item.createdAt.S) : "",
          updatedAt: item.updatedAt?.S ? new Date(item.updatedAt.S) : "",
          username: item.username?.S || "",
          firstName: item.firstName?.S || "",
          lastName: item.lastName?.S || "",
        };
      });
      return users;
    }
    return [];
  }

  async getUser(userId: string): Promise<UserProfile | null> {
    const params = {
      TableName: TableName,
      Key: {
        userId: { S: userId },
      },
    };

    const { Item } = await dynamoClient.send(new GetItemCommand(params));
    return {
      userId: Item?.userId.S,
      email: Item?.email.S,
      stripeCustomerId: Item?.stripeCustomerId?.S,
      isSubscriber: Item?.isSubscriber.BOOL,
      createdAt: Item?.createdAt?.S ? new Date(Item?.createdAt.S) : "",
      updatedAt: Item?.updatedAt?.S ? new Date(Item?.updatedAt.S) : "",
      username: Item?.username?.S || "",
      firstName: Item?.firstName?.S || "",
      lastName: Item?.lastName?.S || "",
    } as UserProfile;
  }

  async updateProfileAsync(userId: string, profileUpdates: Partial<UserProfile>): Promise<UserProfile> {
    const now = new Date().toISOString();

    if (profileUpdates.username) {
      const usernameExists = await this.findProfileByUsernameAsync(profileUpdates.username);
      if (usernameExists && usernameExists.userId !== userId) {
        throw new Error("Username already exists");
      }
    }

    let updateExpression = "set updatedAt = :updatedAt, ";
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {
      ":updatedAt": { S: now },
    };

    for (const [key, value] of Object.entries(profileUpdates)) {
      updateExpression += `#${key} = :${key}, `;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = { S: value };
    }

    const params: any = {
      TableName: TableName,
      Key: {
        userId: { S: userId },
      },
      UpdateExpression: updateExpression.slice(0, -2),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };
    try {
      const { Attributes }: any = await dynamoClient.send(new UpdateItemCommand(params));

      const user = unmarshall(Attributes) as UserProfile;
      return user;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Could not update user profile");
    }
  }

  async findProfileByUsernameAsync(username: string): Promise<UserProfile | null> {
    const params = {
      TableName: TableName,
      FilterExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": { S: username },
      },
    };

    try {
      const { Items }: any = await dynamoClient.send(new ScanCommand(params));
      if (!Items || Items.length === 0) {
        return null;
      }

      const Item = Items[0];
      return {
        userId: Item.userId.S,
        email: Item.email.S,
        stripeCustomerId: Item.stripeCustomerId?.S,
        isSubscriber: Item.isSubscriber.BOOL,
        createdAt: new Date(Item.createdAt.S),
        updatedAt: new Date(Item.updatedAt.S),
        username: Item.username?.S || "",
        firstName: Item.firstName?.S || "",
        lastName: Item.lastName?.S || "",
      } as UserProfile;
    } catch (error) {
      console.error("Error fetching user profile by username:", error);
      throw new Error("Could not fetch user profile by username");
    }
  }

  async createProfileAsync(profile: UserProfile): Promise<PutItemCommandOutput | UserProfile> {
    const now = new Date();

    // Check if the profile already exists
    const getParams = {
      TableName: TableName,
      Key: {
        userId: { S: profile.userId },
      },
    };

    try {
      const { Item }: any = await dynamoClient.send(new GetItemCommand(getParams));

      if (Item) {
        console.log(Item);
        // Profile already exists, return the existing profile
        return {
          userId: Item.userId.S,
          email: Item.email.S,
          stripeCustomerId: Item.stripeCustomerId?.S,
          isSubscriber: Item.isSubscriber.BOOL,
          createdAt: new Date(Item.createdAt.S),
          updatedAt: new Date(Item.updatedAt.S),
          username: Item.username?.S || "",
          firstName: Item.firstName?.S || "",
          lastName: Item.lastName?.S || "",
        } as UserProfile;
      } else {
        // Profile does not exist, create a new profile
        const putParams = {
          TableName: TableName,
          Item: {
            userId: { S: profile.userId },
            email: { S: profile.email },
            // stripeCustomerId: { S: "" },
            isSubscriber: { BOOL: false },
            createdAt: { S: now.toISOString() },
            updatedAt: { S: now.toISOString() },
            username: { S: profile?.username || "" },
            firstName: { S: profile?.firstName || "" },
            lastName: { S: profile?.lastName || "" },
          },
        };
        await dynamoClient.send(new PutItemCommand(putParams));

        // Construct and return the profile object
        return {
          userId: profile.userId,
          email: profile.email,
          // stripeCustomerId: "",
          isSubscriber: false,
          createdAt: now,
          updatedAt: now,
          username: profile?.username || "",
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
        } as UserProfile;
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw new Error("Could not create user profile");
    }
  }
}

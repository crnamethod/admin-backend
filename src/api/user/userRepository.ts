import type { User, UserProfile } from "@/api/user/userModel";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
// export const users: User[] = [
//   {
//     id: 1,
//     name: "Alice",
//     email: "alice@example.com",
//     createdAt: new Date(),
//     updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
//   },
//   {
//     id: 2,
//     name: "Robert",
//     email: "Robert@example.com",
//     createdAt: new Date(),
//     updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
//   },
// ];

const TableName = env.DYNAMODB_TBL_USERPROFILE;

export class UserRepository {
  // async findAllAsync(): Promise<User[]> {
  //   return users;
  // }

  // async findByIdAsync(id: number): Promise<User | null> {
  //   return users.find((user) => user.id === id) || null;
  // }

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
}

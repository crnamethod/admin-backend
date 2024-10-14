import { StatusCodes } from "http-status-codes";

import type { User, UserProfile } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import { AdminSetUserPasswordCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export class UserService {
  private userRepository: UserRepository;
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
    const region = env.AWS_DEFAULT_REGION;
    this.cognitoClient = new CognitoIdentityProviderClient({ region });
    this.userPoolId = env.USER_POOL_ID;
  }

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<UserProfile[] | null>> {
    try {
      const users = await this.userRepository.getAllUsers();
      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<UserProfile[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(userId: string): Promise<ServiceResponse<UserProfile | null>> {
    try {
      const user = await this.userRepository.getUser(userId);
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<UserProfile>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${userId}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(
    userId: string,
    profileUpdates: Partial<UserProfile>,
  ): Promise<ServiceResponse<UserProfile | null>> {
    try {
      const updatedProfile = await this.userRepository.updateProfileAsync(userId, profileUpdates);
      return ServiceResponse.success<UserProfile>("Profile updated", updatedProfile, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error updating profile: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createProfile(
    profile: Omit<UserProfile, "createdAt" | "updatedAt" | "isSubscriber">,
  ): Promise<ServiceResponse<null>> {
    try {
      await this.userRepository.createProfileAsync(profile);
      return ServiceResponse.success<null>("Profile created", null, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = `Error creating profile: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async changePassword(username: string, newPassword: string): Promise<void> {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId, // Use user pool ID from the constructor
      Username: username, // Username of the user
      Password: newPassword, // The new password
      Permanent: true, // Set to true to make the password permanent
    });

    try {
      const response = await this.cognitoClient.send(command);
      console.log("Password changed successfully by admin:", response);
    } catch (error) {
      console.error("Error changing password by admin:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }
}

export const userService = new UserService();

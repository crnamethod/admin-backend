import { StatusCodes } from "http-status-codes";

import type { User, UserProfile } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
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
}

export const userService = new UserService();

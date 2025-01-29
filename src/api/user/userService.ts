import { AdminSetUserPasswordCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import type { UploadedFile } from "express-fileupload";
import { StatusCodes } from "http-status-codes";

import type { UserProfile } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { s3Service } from "@/common/services/s3.service";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { env } from "@/common/utils/envConfig";
import { HttpException } from "@/common/utils/http-exception";

import type { CreateUserProfileDto } from "./dto/create-user.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { UserProfileBodyDto } from "./dto/upload-photo.dto";

export class UserService {
  private userRepository: UserRepository;
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private readonly path: string;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
    this.cognitoClient = new CognitoIdentityProviderClient({ region: env.AWS_DEFAULT_REGION });
    this.userPoolId = env.USER_POOL_ID;
    this.path = "profile_photos";
  }

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<UserProfile[] | []>> {
    const users = await this.userRepository.getAllUsers();

    if (!users || users.length === 0) {
      return ServiceResponse.failure("No Users found", [], StatusCodes.NOT_FOUND);
    }

    return ServiceResponse.success<UserProfile[]>("Users found", users);
  }

  async findOne(id: string, options?: GetCommandOptions) {
    const user = await this.userRepository.findOne(id, options);

    return ServiceResponse.success("User found", user);
  }

  async findOneOrThrow(id: string, options?: GetCommandOptions) {
    const user = await this.userRepository.findOne(id, options);

    if (!user) throw new HttpException("User not found", 404);

    return ServiceResponse.success<UserProfile>("User found", user);
  }

  async update(userId: string, updateDto: UpdateProfileDto): Promise<ServiceResponse<UserProfile | null>> {
    const updatedProfile = await this.userRepository.updateProfileAsync(userId, updateDto);
    return ServiceResponse.success<UserProfile>("Profile updated", updatedProfile, StatusCodes.OK);
  }

  async create(profile: CreateUserProfileDto) {
    await this.userRepository.createProfileAsync(profile);
    return ServiceResponse.success<null>("Profile created", null, StatusCodes.CREATED);
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

  async upload({ id }: UserProfileBodyDto, file: UploadedFile) {
    // ? check if user is existing in the Database
    const { responseObject: foundUser } = await this.findOneOrThrow(id, { ProjectionExpression: "image_path" });

    if (foundUser.image_path) {
      // ? Delete the existing file from S3
      await s3Service.deleteFile(this.path, foundUser.image_path);
    }

    const fileUrl = await s3Service.uploadFile(this.path, file, id);

    return await this.update(id, { image_path: fileUrl });
  }

  async deleteFile(path: string, key: string) {
    return await s3Service.deleteFile(path, key);
  }
}

export const userService = new UserService();

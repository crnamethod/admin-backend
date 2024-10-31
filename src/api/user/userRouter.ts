import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserProfileSchema, UserSchema } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { UpdatePasswordSchema } from "./dto/update-password.dto";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

export const CreateUserProfileSchema = z.object({
  body: z.object({
    UserProfileSchema,
  }),
});
const UpdateProfileSchema = UserProfileSchema.partial();
const CreateProfileResponseSchema = z.object({
  message: z.string(),
});

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
  method: "get",
  path: "/user/profile",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchema), "Success"),
});
userRouter.get("/profile", userController.getUsers);

// --------------------
userRegistry.registerPath({
  method: "get",
  path: "/user/profile/{id}",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});
userRouter.get("/profile/:id", validateRequest(GetUserSchema), userController.getUser);

// -------------------
userRegistry.registerPath({
  method: "patch",
  path: "/user/profile/{userId}",
  tags: ["User"],
  parameters: [
    {
      name: "userId",
      in: "path",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: createApiResponse(UserProfileSchema, "Profile updated successfully"),
});
userRouter.patch("/profile/:userId", validateRequest(UpdateProfileSchema), userController.updateUser);

// ------------------
userRegistry.registerPath({
  method: "post",
  path: "/user/profile",
  tags: ["User"],
  description: "Create a user profile",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserProfileSchema,
        },
      },
    },
  },
  responses: createApiResponse(CreateProfileResponseSchema, "Profile created successfully"),
});

userRouter.post("/profile", validateRequest(CreateUserProfileSchema), userController.createUser);

// -------------------
userRegistry.registerPath({
  method: "put",
  path: "/user/profile/{userId}",
  tags: ["User"],
  responses: createApiResponse(UpdatePasswordSchema, "Password changed successfully"),
});
userRouter.put("/profile/:userId", validateRequest(UpdatePasswordSchema), userController.changePassword);

userRouter.post("/upload", userController.uploadPicture);

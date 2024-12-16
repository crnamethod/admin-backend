import type { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import type { UploadedFile } from "express-fileupload";

import { userService } from "@/api/user/userService";
import type { TypedRequestBody } from "@/common/types/request.type";

import type { UpdatePasswordDto } from "./dto/update-password.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { UserProfileBodyDto } from "./dto/upload-photo.dto";

class UserController {
  public getUsers = expressAsyncHandler(async (req, res) => {
    const serviceResponse = await userService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  });

  public getUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const serviceResponse = await userService.findOneOrThrow(req.params.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  });

  public updateUser = expressAsyncHandler(async (req: TypedRequestBody<UpdateProfileDto>, res: Response) => {
    const serviceResponse = await userService.update(req.params.userId, req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  });

  public createUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const userProfile = req.body as { email: string; userId: string };

    const serviceResponse = await userService.create(userProfile);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  });

  public changePassword = expressAsyncHandler(async (req: TypedRequestBody<UpdatePasswordDto>, res: Response) => {
    await userService.changePassword(req.body.email, req.body.password);
    res.status(200).json({ message: "Password changed successfully " });
  });

  public uploadPicture = expressAsyncHandler(async (req: TypedRequestBody<UserProfileBodyDto>, res: Response) => {
    const serviceResponse = await userService.upload(req.body, req.files?.file as UploadedFile);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  });
}

export const userController = new UserController();

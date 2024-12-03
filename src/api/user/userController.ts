import type { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import type { UploadedFile } from "express-fileupload";

import { userService } from "@/api/user/userService";
import type { TypedRequestBody } from "@/common/types/request.type";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

import type { UpdatePasswordDto } from "./dto/update-password.dto";
import type { UserProfileBodyDto } from "./dto/upload-photo.dto";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.findOneOrThrow(req.params.id);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.update(req.params.userId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const userProfile = req.body as { email: string; userId: string };

    const serviceResponse = await userService.create(userProfile);
    return handleServiceResponse(serviceResponse, res);
  };

  public changePassword: RequestHandler = async (req: TypedRequestBody<UpdatePasswordDto>, res: Response) => {
    await userService.changePassword(req.body.email, req.body.password);
    res.status(200).json({ message: "Password changed successfully " });
  };

  public uploadPicture: RequestHandler = expressAsyncHandler(
    async (req: TypedRequestBody<UserProfileBodyDto>, res: Response) => {
      const data = await userService.upload(req.body, req.files?.file as UploadedFile);

      res.status(200).json({
        message: "Image uploaded successfully",
        data,
      });
    },
  );
}

export const userController = new UserController();

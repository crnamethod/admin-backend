import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { upload } from "@/common/services/s3.service";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    console.log(req.params);
    const id = Number.parseInt(req.params.id as string, 10);
    const userId = req.params.id as string;
    const serviceResponse = await userService.findById(userId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const profileUpdates = req.body;

    const serviceResponse = await userService.updateProfile(userId, profileUpdates);
    return handleServiceResponse(serviceResponse, res);
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const userProfile = req.body as { email: string; userId: string };

    const serviceResponse = await userService.createProfile(userProfile);
    return handleServiceResponse(serviceResponse, res);
  };

  public changePassword: RequestHandler = async (req: Request, res: Response) => {
    const data = req.body as { email: string; password: string };
    const serviceResponse = await userService.changePassword(data.email, data.password);
    res.status(200).json({ message: "Password changed successfully " });
  };

  public uploadPicture: RequestHandler = async (req: Request, res: Response) => {
    upload.single("image")(req, res, async (err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to upload image", details: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = (req.file as Express.MulterS3.File).location;
      res.status(200).json({ message: "Image uploaded successfully", fileUrl });
    });
  };
}

export const userController = new UserController();

import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
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
}

export const userController = new UserController();

import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { getSchool, getSchools, updateSchools } from "./schoolService";

class SchoolController {
  public getShools: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await getSchools();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getShool: RequestHandler = async (req: Request, res: Response) => {
    const schoolId = req.params.id as string;
    try {
      const data = await getSchool(schoolId);
      console.log(data);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public updateShool: RequestHandler = async (req: Request, res: Response) => {
    try {
      const updates = req.body.update;
      const data = await updateSchools(updates);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const schoolController = new SchoolController();

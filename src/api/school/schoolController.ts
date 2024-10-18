import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { addSchool, getSchool, getSchools, updateSchool } from "./schoolService";

class SchoolController {
  public getShools: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await getSchools(req.query);
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
      const data = await updateSchool(req.body);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public addSchool: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await addSchool(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const schoolController = new SchoolController();

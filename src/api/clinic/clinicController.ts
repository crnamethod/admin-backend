import type { Request, RequestHandler, Response } from "express";

import { clinicService } from "./clinicService";
import {
  TypedRequestBody,
  TypedRequestQuery,
} from "@/common/types/request.type";
import { FindAllClinicDto } from "./dto/get-all-clinic.dto";

class ClinicController {
  public getAll: RequestHandler = async (
    req: TypedRequestQuery<FindAllClinicDto>,
    res: Response
  ) => {
    console.log(req.query);
    try {
      const data = await clinicService.findAll(req.query);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getOne: RequestHandler = async (req: Request, res: Response) => {
    const clinicId = req.params.clinicId as string;
    try {
      const data = await clinicService.findOne(clinicId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public updateClinic: RequestHandler = async (req: Request, res: Response) => {
    const { clinicId } = req.params;
    const clinicUpdates = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    try {
      const data = await await clinicService.updateClinic(
        clinicId,
        clinicUpdates
      );
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public createClinic: RequestHandler = async (req: Request, res: Response) => {
    try {
      const data = await await clinicService.createClinic(req.body);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const clinicController = new ClinicController();

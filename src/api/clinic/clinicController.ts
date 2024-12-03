import type { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";

import type { TypedRequestBody, TypedRequestQuery } from "@/common/types/request.type";

import { clinicService } from "./clinicService";
import type { CreateClinicDto } from "./dto/create-clinic.dto";
import type { FindAllClinicDto } from "./dto/get-all-clinic.dto";
import type { UpdateClinicDto } from "./dto/update-clinic.dto";

class ClinicController {
  public createClinic: RequestHandler = expressAsyncHandler(
    async (req: TypedRequestBody<CreateClinicDto>, res: Response) => {
      const data = await clinicService.createClinic(req.body);
      res.status(data.statusCode).json(data);
    },
  );

  public updateClinic: RequestHandler = expressAsyncHandler(
    async (req: TypedRequestBody<UpdateClinicDto>, res: Response) => {
      const data = await clinicService.updateClinic(req.params.id, req.body);
      res.status(data.statusCode).json(data);
    },
  );

  public getAll: RequestHandler = expressAsyncHandler(
    async (req: TypedRequestQuery<FindAllClinicDto>, res: Response) => {
      const data = await clinicService.findAll(req.query);
      res.status(data.statusCode).json(data);
    },
  );

  public getOne: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await clinicService.findOneOrThrow(req.params.id);
    res.status(data.statusCode).json(data);
  });
}

export const clinicController = new ClinicController();

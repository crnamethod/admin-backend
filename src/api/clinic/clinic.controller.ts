import type { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";

import type { TypedRequestBody, TypedRequestQuery } from "@/common/types/request.type";

import { clinicService } from "./clinic.service";
import type { CreateClinicDto } from "./dto/create-clinic.dto";
import type { FindAllClinicBySchoolDto } from "./dto/get-all-clinic-by-school.dto";
import type { FindAllClinicDto } from "./dto/get-all-clinic.dto";
import type { UpdateClinicDto } from "./dto/update-clinic.dto";

class ClinicController {
  public createClinic = expressAsyncHandler(async (req: TypedRequestBody<CreateClinicDto>, res: Response) => {
    const data = await clinicService.createClinic(req.body);
    res.status(data.statusCode).json(data);
  });

  public updateClinic = expressAsyncHandler(async (req: TypedRequestBody<UpdateClinicDto>, res: Response) => {
    const data = await clinicService.updateClinic(req.params.id, req.body);
    res.status(data.statusCode).json(data);
  });

  public getAll = expressAsyncHandler(async (req: TypedRequestQuery<FindAllClinicDto>, res: Response) => {
    const data = await clinicService.findAll(req.query);
    res.status(data.statusCode).json(data);
  });

  public findAllBySchool = expressAsyncHandler(async (req: TypedRequestQuery<FindAllClinicBySchoolDto>, res) => {
    const data = await clinicService.findAllBySchool(req.query);
    res.status(data.statusCode).json(data);
  });

  public getOne = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await clinicService.findOneOrThrow(req.params.id);
    res.status(data.statusCode).json(data);
  });

  public getAssociatedSchools = expressAsyncHandler(async (req, res) => {
    const data = await clinicService.findAssociatedSchools(req.params.id);
    res.status(data.statusCode).json(data);
  });

  public softDelete = expressAsyncHandler(async (req, res) => {
    const data = await clinicService.softDelete(req.params.id);
    res.status(data.statusCode).json(data);
  });

  public restore = expressAsyncHandler(async (req, res) => {
    const data = await clinicService.restore(req.params.id);
    res.status(data.statusCode).json(data);
  });

  public forceRemove = expressAsyncHandler(async (req, res) => {
    const data = await clinicService.forceRemove(req.params.id);
    res.status(data.statusCode).json(data);
  });
}

export const clinicController = new ClinicController();

import type { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";

import type { TypedRequest, TypedRequestBody, TypedRequestQuery } from "@/common/types/request.type";

import type { CreatePrerequisiteSchoolDto } from "../dto/create-prerequisite-school.dto";
import type { FindPrerequisiteBySchoolDto, FindPrerequisiteSchoolDto } from "../dto/get-prerequisite-school.dto";
import type { UpdatePrerequisiteSchoolDto } from "../dto/update-prerequisite-school.dto";
import { prerequisiteSchoolService } from "../services/prerequisite-school.service";

class PrerequisiteSchoolController {
  public create: RequestHandler = expressAsyncHandler(async (req: TypedRequestBody<CreatePrerequisiteSchoolDto>, res) => {
    const data = await prerequisiteSchoolService.create(req.body);
    res.status(201).json(data);
  });

  public update = expressAsyncHandler(async (req: TypedRequest<UpdatePrerequisiteSchoolDto, FindPrerequisiteSchoolDto>, res) => {
    const data = await prerequisiteSchoolService.update(req.query, req.body);
    res.status(200).json(data);
  });

  public findAll = expressAsyncHandler(async (req, res) => {
    const data = await prerequisiteSchoolService.findAll();

    res.status(data.statusCode).json(data);
  });

  public findAllBySchool = expressAsyncHandler(async (req: TypedRequestQuery<FindPrerequisiteBySchoolDto>, res) => {
    const data = await prerequisiteSchoolService.findAllBySchool(req.query.schoolId);

    res.status(data.statusCode).json(data);
  });

  public findOne = expressAsyncHandler(async (req: TypedRequestQuery<FindPrerequisiteSchoolDto>, res) => {
    const data = await prerequisiteSchoolService.findOneOrThrow(req.query);

    res.status(data.statusCode).json(data);
  });
}

export const prerequisiteSchoolController = new PrerequisiteSchoolController();

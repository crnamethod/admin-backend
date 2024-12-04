import type { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";

import type { TypedRequestBody } from "@/common/types/request.type";

import type { CreatePrerequisiteDto } from "../dto/create-prerequisite.dto";
import { prerequisiteService } from "../services/prerequisite.service";

class PrerequisiteController {
  public create: RequestHandler = expressAsyncHandler(async (req: TypedRequestBody<CreatePrerequisiteDto>, res) => {
    const data = await prerequisiteService.create(req.body);

    res.status(data.statusCode).json(data);
  });

  public findAll: RequestHandler = expressAsyncHandler(async (req, res) => {
    const data = await prerequisiteService.findAll();

    res.status(data.statusCode).json(data);
  });

  public findOne: RequestHandler = expressAsyncHandler(async (req, res) => {
    const data = await prerequisiteService.findOneOrThrow(req.params.id);

    res.status(data.statusCode).json(data);
  });
}

export const prerequisiteController = new PrerequisiteController();

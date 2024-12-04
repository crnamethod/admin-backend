import type { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import type { UploadedFile } from "express-fileupload";

import type { TypedRequestBody } from "@/common/types/request.type";

import type { AssignClinicDto } from "./dto/assign-clinic.dto";
import type { RemoveClinicDto } from "./dto/remove-clinic.dto";
import type { RemovePrerequisiteDto } from "./dto/remove-prerequisite.dto";
import type { SchoolImageBodyDto } from "./dto/upload-image.dto";
import { schoolService } from "./schoolService";

class SchoolController {
  public getShools: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await schoolService.getSchools(req.query);
    res.status(200).json(data);
  });

  public getShool: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await schoolService.findOneOrThrow(req.params.id);
    res.status(200).json(data);
  });

  public updateShool: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await schoolService.update(req.params.id, req.body);
    res.status(200).json(data);
  });

  public addSchool: RequestHandler = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = await schoolService.create(req.body);
    res.status(201).json(data);
  });

  public assignClinic: RequestHandler = expressAsyncHandler(async (req: TypedRequestBody<AssignClinicDto>, res) => {
    const data = await schoolService.assignClinic(req.body);
    res.status(data.statusCode).json(data);
  });

  public removeClinic: RequestHandler = expressAsyncHandler(async (req: TypedRequestBody<RemoveClinicDto>, res) => {
    const data = await schoolService.removeClinic(req.body);
    res.status(data.statusCode).json(data);
  });

  public removePrerequisite: RequestHandler = expressAsyncHandler(
    async (req: TypedRequestBody<RemovePrerequisiteDto>, res) => {
      const data = await schoolService.removePrerequisite(req.body);
      res.status(data.statusCode).json(data);
    },
  );

  public uploadPicture: RequestHandler = async (req: TypedRequestBody<SchoolImageBodyDto>, res: Response) => {
    const data = await schoolService.upload(req.body, req.files?.file as UploadedFile);

    res.status(200).json({
      message: "Image uploaded successfully",
      data,
    });
  };
}

export const schoolController = new SchoolController();

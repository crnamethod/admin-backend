import type { Request, RequestHandler, Response } from "express";

import { upload } from "@/common/services/s3.service";
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

  public uploadPicture: RequestHandler = async (req: Request, res: Response) => {
    upload.single("image")(req, res, async (err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to upload image", details: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = (req.file as Express.MulterS3.File).location;

      // update banner
      const data = {
        id: req.body.id,
        name: req.body.name,
        banner: fileUrl,
      };
      await updateSchool(data);

      res.status(200).json({ message: "Image uploaded successfully", fileUrl });
    });
  };
}

export const schoolController = new SchoolController();

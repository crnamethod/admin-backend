import type { UploadedFile } from "express-fileupload";

import { s3Service } from "@/common/services/s3.service";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { HttpException } from "@/common/utils/http-exception";

import type { CreateSchoolDto } from "./dto/create-school.dto";
import type { GetSchoolsQueryDto } from "./dto/filter-school.dto";
import type { UpdateSchoolDto } from "./dto/update-school.dto";
import type { SchoolImageBodyDto } from "./dto/upload-image.dto";
import { schoolRepository } from "./schoolRepository";

class SchoolService {
  async create(school: CreateSchoolDto) {
    const foundExisting = await this.findOne(school.id);

    if (foundExisting) throw new HttpException("School already exists", 409);

    return await schoolRepository.create(school);
  }

  async update(id: string, updateDto: UpdateSchoolDto) {
    return await schoolRepository.update(id, updateDto);
  }

  async getSchools(query: GetSchoolsQueryDto) {
    return await schoolRepository.findAllSchoolsWithPaginated(query);
  }

  async findOne(id: string, options?: GetCommandOptions) {
    const school = await schoolRepository.findOne(id, options);
    return school ?? null;
  }

  async findOneOrThrow(id: string, options?: GetCommandOptions) {
    const school = await schoolRepository.findOne(id, options);

    if (!school) throw new HttpException("School not found", 404);

    return school;
  }

  async upload({ id, type }: SchoolImageBodyDto, file: UploadedFile) {
    const path = type === "image_url" ? "school-images" : "thumbnails";

    // ? check if journalId is existing in the Database
    const foundSchool = await this.findOneOrThrow(id, { ProjectionExpression: "thumbnail_url, image_url" });

    if (foundSchool[type]) {
      // ? Delete the existing file from S3
      await this.deleteFile(path, foundSchool[type]);
    }

    const fileUrl = await s3Service.uploadFile(path, file, id);

    return await this.update(id, { [type]: fileUrl });
  }

  async deleteFile(path: string, key: string) {
    return await s3Service.deleteFile(path, key);
  }
}

export const schoolService = new SchoolService();

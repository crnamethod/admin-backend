import type { UploadedFile } from "express-fileupload";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { s3Service } from "@/common/services/s3.service";
import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { HttpException } from "@/common/utils/http-exception";

import { prerequisiteSchoolService } from "../prerequisite/services/prerequisite-school.service";
import type { AssignClinicDto } from "./dto/assign-clinic.dto";
import type { AssignPrerequisiteDto } from "./dto/assign-prerequisite.dto";
import type { CreateSchoolDto } from "./dto/create-school.dto";
import type { GetSchoolsQueryDto } from "./dto/filter-school.dto";
import type { RemoveClinicDto } from "./dto/remove-clinic.dto";
import type { RemovePrerequisiteDto } from "./dto/remove-prerequisite.dto";
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
    return await schoolRepository.findOne(id, options);
  }

  async findOneOrThrow(id: string, options?: GetCommandOptions) {
    const school = await schoolRepository.findOne(id, options);

    if (!school) throw new HttpException("School not found", 404);

    return school;
  }

  async assignClinic(assignDto: AssignClinicDto) {
    assignDto.clinicIds = new Set(assignDto.clinicIds);

    const updatedSchool = await schoolRepository.assignClinic(assignDto);

    return ServiceResponse.success("Clinic added successfully", updatedSchool, StatusCodes.CREATED);
  }

  async removeClinic(removeDto: RemoveClinicDto) {
    removeDto.clinicIds = new Set(removeDto.clinicIds);

    const updatedSchool = await schoolRepository.removeClinic(removeDto);

    return ServiceResponse.success("Clinic removed successfully", updatedSchool, StatusCodes.OK);
  }

  async assignPrerequisite(assignDto: AssignPrerequisiteDto) {
    const updatedSchool = await schoolRepository.assignPrerequisite(assignDto);

    return ServiceResponse.success("Prerequisite added successfully", updatedSchool, StatusCodes.CREATED);
  }

  async removePrerequisite(removeDto: RemovePrerequisiteDto) {
    const updatedSchool = await schoolRepository.removePrerequisite(removeDto);

    // * Delete associated prerequisite schools by PREREQUISITE ID
    await prerequisiteSchoolService.remove(
      removeDto.id,
      removeDto.prerequisites.map((p) => p.prerequisiteId),
    );

    return ServiceResponse.success("Prerequisite removed successfully", updatedSchool, StatusCodes.OK);
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

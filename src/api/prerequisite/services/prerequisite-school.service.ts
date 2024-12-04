import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

import { schoolService } from "@/api/school/schoolService";
import type { CreatePrerequisiteSchoolDto } from "../dto/create-prerequisite-school.dto";
import type { FindPrerequisiteSchoolDto } from "../dto/get-prerequisite-school.dto";
import { prerequisiteSchoolRepository } from "../repositories/prerequisite-school.repository";

class PrerequisiteSchoolService {
  async create(createDto: CreatePrerequisiteSchoolDto) {
    const { schoolId } = createDto;

    const newPrerequisiteSchools = await prerequisiteSchoolRepository.create(createDto);

    const prerequisiteNames = new Set(newPrerequisiteSchools.map((p) => p.name));

    // ? Assign new Prerequisite Schools to School
    await schoolService.assignPrerequisite({ id: schoolId, prerequisiteIds: prerequisiteNames });

    return ServiceResponse.success(
      "Prerequisite School created successfully",
      newPrerequisiteSchools,
      StatusCodes.CREATED,
    );
  }

  async findAll() {
    const prerequisiteSchools = await prerequisiteSchoolRepository.findAll();
    return ServiceResponse.success("Prerequisite Schools fetched successfully", prerequisiteSchools, StatusCodes.OK);
  }

  async findAllBySchool(schoolId: string) {
    const prerequisiteSchools = await prerequisiteSchoolRepository.findAllBySchool(schoolId);
    return ServiceResponse.success("Prerequisites by School fetched successfully", prerequisiteSchools, StatusCodes.OK);
  }

  async findOneOrThrow({ prerequisiteId, schoolId }: FindPrerequisiteSchoolDto) {
    const prerequisiteSchool = await prerequisiteSchoolRepository.findOne(prerequisiteId, schoolId);

    if (!prerequisiteSchool) throw new HttpException("Prerequisite School not found", 404);

    return ServiceResponse.success("Prerequisite School fetched successfully", prerequisiteSchool, StatusCodes.OK);
  }

  async remove(schoolId: string, prerequisiteIds: string[]) {
    await prerequisiteSchoolRepository.remove(schoolId, prerequisiteIds);
    return ServiceResponse.success("Prerequisite Schools removed successfully", null, StatusCodes.OK);
  }
}

export const prerequisiteSchoolService = new PrerequisiteSchoolService();

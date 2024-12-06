import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";
import { StatusCodes } from "http-status-codes";
import type { CreatePrerequisiteDto } from "../dto/create-prerequisite.dto";
import type { UpdatePrerequisiteDto } from "../dto/update-prerequisite.dto";
import { prerequisiteSchoolRepository } from "../repositories/prerequisite-school.repository";
import { prerequisiteRepository } from "../repositories/prerequisite.repository";

class PrerequisiteService {
  async create(createDto: CreatePrerequisiteDto) {
    const newPrerequisite = await prerequisiteRepository.create(createDto);

    return ServiceResponse.success("Prerequisite created successfully", newPrerequisite, StatusCodes.CREATED);
  }

  async update(id: string, updateDto: UpdatePrerequisiteDto) {
    const updatedData = await prerequisiteRepository.update(id, updateDto);

    // * Update all labels in Prerequisite Schools
    await prerequisiteSchoolRepository.updateMany(id, updateDto);

    return ServiceResponse.success("Prerequisite updated successfully", updatedData, StatusCodes.OK);
  }

  async findAll() {
    const prerequisites = await prerequisiteRepository.findAll();
    return ServiceResponse.success("Prerequisites fetched successfully", prerequisites, StatusCodes.OK);
  }

  async findOneOrThrow(id: string) {
    const prerequisite = await prerequisiteRepository.findOne(id);

    if (!prerequisite) throw new HttpException("Prerequisite not found", 404);

    return ServiceResponse.success("Prerequisite fetched successfully", prerequisite, StatusCodes.OK);
  }
}

export const prerequisiteService = new PrerequisiteService();

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";
import { StatusCodes } from "http-status-codes";
import type { CreatePrerequisiteDto } from "../dto/create-prerequisite.dto";
import { prerequisiteRepository } from "../repositories/prerequisite.repository";

class PrerequisiteService {
  async create(createDto: CreatePrerequisiteDto) {
    const newPrerequisite = await prerequisiteRepository.create(createDto);

    return ServiceResponse.success("Prerequisite created successfully", newPrerequisite, StatusCodes.CREATED);
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

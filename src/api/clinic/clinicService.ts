import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

import { clinicRepository } from "./clinicRepository";
import type { CreateClinicDto } from "./dto/create-clinic.dto";
import type { FindAllClinicDto } from "./dto/get-all-clinic.dto";
import type { UpdateClinicDto } from "./dto/update-clinic.dto";

class ClinicService {
  async createClinic(createDto: CreateClinicDto) {
    const foundClinic = await clinicRepository.findByNameAndAddress(createDto.name, createDto.address);

    if (foundClinic)
      return ServiceResponse.failure(
        "Clinic with the same name and address already exists",
        null,
        StatusCodes.BAD_REQUEST,
      );

    const newClinic = await clinicRepository.create(createDto);

    return ServiceResponse.success("Clinic created successfully", newClinic, StatusCodes.CREATED);
  }

  async updateClinic(id: string, updateDto: UpdateClinicDto) {
    const updatedClinic = await clinicRepository.update(id, updateDto);
    return ServiceResponse.success("Clinic updated successfully", updatedClinic, StatusCodes.OK);
  }

  async findAll(query: FindAllClinicDto) {
    const clinics = await clinicRepository.findAll(query);
    return ServiceResponse.success("Clinic updated successfully", clinics, StatusCodes.OK);
  }

  async findOne(clinicId: string) {
    const clinic = await clinicRepository.findOne(clinicId);

    return ServiceResponse.success("Clinic fetched successfully", clinic, StatusCodes.OK);
  }

  async findOneOrThrow(clinicId: string) {
    const clinic = await clinicRepository.findOne(clinicId);

    if (!clinic) throw new HttpException("Clinic not found", 404);

    return ServiceResponse.success("Clinic fetched successfully", clinic, StatusCodes.OK);
  }
}

export const clinicService = new ClinicService();

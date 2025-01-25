import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { QueryCommandOptions } from "@/common/types/dynamo-options.type";

import type { CreateSchoolClinicDto } from "./dto/create-school-clinic.dto";
import type { DeleteSchoolClinicDto } from "./dto/delete-school-clinic.dto";
import { schoolClinicRepository } from "./school-clinic.repository";

class SchoolClinicService {
  async create(dto: CreateSchoolClinicDto) {
    const newSchoolClinics = await schoolClinicRepository.createByBatch(dto);

    return ServiceResponse.success("School Clinics created successfully", newSchoolClinics, StatusCodes.CREATED);
  }

  async findAllByClinic(clinicId: string, options?: QueryCommandOptions) {
    const schoolClinics = await schoolClinicRepository.findAllByClinic(clinicId, options);

    return ServiceResponse.success("School Clinics fetched successfully", schoolClinics, StatusCodes.OK);
  }

  async delete(dto: DeleteSchoolClinicDto) {
    await schoolClinicRepository.deleteByBatch(dto);

    return ServiceResponse.success("School Clinics deleted successfully", null, StatusCodes.NO_CONTENT);
  }
}

export const schoolClinicService = new SchoolClinicService();

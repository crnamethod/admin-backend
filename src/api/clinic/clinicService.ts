import { ServiceResponse } from "@/common/models/serviceResponse";
import { ClinicType } from "./clinicModel";
import { clinicRepository } from "./clinicRepository";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { StatusCodes } from "http-status-codes";

interface GetReviewsQuery {
  limit?: number; // Optional number
  clinicId?: string; // Optional string
}

export const clinicService = {
  findAll: async (query: GetReviewsQuery) => {
    const { limit, clinicId: lastClinicId } = query;
    const parsedLimit = limit ? Number(limit) : undefined;

    return await clinicRepository.findAll(lastClinicId, parsedLimit);
  },
  findOne: async (clinicId: string) => {
    return await clinicRepository.findOne(clinicId);
  },
  updateClinic: async (
    clinicId: string,
    clinicUpdates: Partial<ClinicType>
  ) => {
    return await clinicRepository.updateClinic(clinicId, clinicUpdates);
  },
  createClinic: async (createDto: CreateClinicDto) => {
    const foundClinic = await clinicRepository.findByNameAndAddress(
      createDto.name,
      createDto.address
    );
    console.log(foundClinic);
    if (foundClinic)
      return ServiceResponse.failure(
        "Clinic with the same name and address already exists",
        null,
        StatusCodes.BAD_REQUEST
      );

    const newClinic = await clinicRepository.create(createDto);

    return ServiceResponse.success(
      "Clinic created successfully",
      newClinic,
      StatusCodes.OK
    );
  },
};

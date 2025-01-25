import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { HttpException } from "@/common/utils/http-exception";

import { clinicReviewService } from "../clinic-review/clinic-review.service";
import { schoolClinicService } from "../school-clinic/school-clinic.service";
import { schoolService } from "../school/schoolService";
import { clinicRepository } from "./clinic.repository";
import type { CreateClinicDto } from "./dto/create-clinic.dto";
import type { FindAllClinicBySchoolDto } from "./dto/get-all-clinic-by-school.dto";
import type { FindAllClinicDto } from "./dto/get-all-clinic.dto";
import type { UpdateClinicDto } from "./dto/update-clinic.dto";
import { ClinicEntity } from "./entity/clinic.entity";

class ClinicService {
  async createClinic(createDto: CreateClinicDto) {
    const foundClinic = await clinicRepository.findByNameAndAddress(createDto.name, createDto.address);

    if (foundClinic && !foundClinic.deletedAt) throw new HttpException("Clinic with the same name and address already exists", 400);

    const newClinic = await clinicRepository.create(createDto);

    return ServiceResponse.success("Clinic created successfully", newClinic, StatusCodes.CREATED);
  }

  async updateClinic(id: string, updateDto: UpdateClinicDto) {
    const updatedClinic = await clinicRepository.update(id, updateDto);
    return ServiceResponse.success("Clinic updated successfully", updatedClinic, StatusCodes.OK);
  }

  async findAll(query: FindAllClinicDto) {
    const clinics = await clinicRepository.findAll(query);
    return ServiceResponse.success("All Clinics fetched successfully", clinics, StatusCodes.OK);
  }

  async findAllBySchool({ schoolId }: FindAllClinicBySchoolDto) {
    const school = await schoolService.findOneOrThrow(schoolId);

    if (!school.clinicIds || school.clinicIds.length === 0) return ServiceResponse.success("There are no clinics assigned for this school", [], StatusCodes.OK);

    const clinics = await clinicRepository.findAllByIds(school.clinicIds);

    const clinicsEntity = await Promise.all(
      clinics.map(async (c) => {
        const { avg_rating, total_reviews } = (await clinicReviewService.calculateRatings(c.clinicId)).responseObject;
        return new ClinicEntity({ ...c, ratings: { avg_rating, total_reviews } });
      }),
    );

    return ServiceResponse.success("Clinics fetched successfully", clinicsEntity, StatusCodes.OK);
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

  async findAssociatedSchools(clinicId: string) {
    const schoolClincs = (await schoolClinicService.findAllByClinic(clinicId, { ProjectionExpression: "schoolId" })).responseObject;

    const schoolIds = schoolClincs.map((s) => s.schoolId);

    // ? This is already a Service Response
    return await schoolService.findAllByIds(schoolIds);
  }

  async softDelete(clinicId: string) {
    const clinic = await clinicRepository.softDelete(clinicId);
    return ServiceResponse.success("Clinic archived successfully", clinic, StatusCodes.OK);
  }

  async restore(clinicId: string) {
    const clinic = await clinicRepository.restore(clinicId);
    return ServiceResponse.success("Clinic restored successfully", clinic, StatusCodes.OK);
  }

  async forceRemove(clinicId: string) {
    await clinicRepository.forceRemove(clinicId);
    return ServiceResponse.success("Clinic deleted successfully", null, StatusCodes.NO_CONTENT);
  }
}

export const clinicService = new ClinicService();

import type { UpdateSchoolDto } from "./dto/update-school.dto";
import type { School } from "./schoolModel";
import { createSchool, listSchool, listSchools, updateSchool as updateSchoolRepo } from "./schoolRepository";

interface GetReviewsQuery {
  limit?: number; // Optional number
  id?: string; // Optional string
  name?: string; // Optional string
}
export const getSchools = async (query: GetReviewsQuery) => {
  const { name, limit, id: lastSchoolId } = query;
  const parsedLimit = limit ? Number(limit) : undefined;

  const data = await listSchools(name, lastSchoolId, parsedLimit);
  return data;
};

export const getSchool = async (schoolId: string) => {
  const data = await listSchool(schoolId);
  return data;
};

export const updateSchool = async (updateDto: UpdateSchoolDto) => {
  const { id, name, ...rest } = updateDto;
  return await updateSchoolRepo(id, name, rest);
};

export const addSchool = async (school: School) => {
  return await createSchool(school);
};

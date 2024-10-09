import { School } from "./schoolModel";
import { listSchool, listSchools, updateSchool as updateSchoolRepo } from "./schoolRepository";

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

export const updateSchools = async (updates: any[]) => {
  const updatePromises = updates.map((update: any) => {
    const { id, name, ...rest } = update;
    return updateSchoolRepo(id, name, rest);
  });
  const updatedSchools = await Promise.all(updatePromises);
  return updatedSchools;
};

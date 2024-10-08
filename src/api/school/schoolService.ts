import { School } from "./schoolModel";
import { listSchool, listSchools, updateSchool as updateSchoolRepo } from "./schoolRepository";

export const getSchools = async () => {
  const data = await listSchools();
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

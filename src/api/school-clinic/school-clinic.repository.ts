import { BatchWriteCommand, type BatchWriteCommandInput, QueryCommand, type QueryCommandInput } from "@aws-sdk/lib-dynamodb";

import type { QueryCommandOptions } from "@/common/types/dynamo-options.type";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";

import type { SchoolEntity } from "../school/entity/school.entity";
import type { CreateSchoolClinicDto } from "./dto/create-school-clinic.dto";
import type { DeleteSchoolClinicDto } from "./dto/delete-school-clinic.dto";
import { SchoolClinicEntity } from "./school-clinic.entity";

const TableName = env.DYNAMODB_TBL_SCHOOL_CLINICS;

class SchoolClinicRepository {
  async createByBatch(dto: CreateSchoolClinicDto) {
    const { schoolId, clinicIds } = dto;

    const newSchoolClinics: SchoolClinicEntity[] = [];

    const schoolClinicItems = clinicIds.map((clinicId) => {
      const newSchoolClinicEntity = new SchoolClinicEntity({ schoolId, clinicId }, { existing: false });

      newSchoolClinics.push(newSchoolClinicEntity);

      return {
        PutRequest: {
          Item: newSchoolClinicEntity,
        },
      };
    });

    const params: BatchWriteCommandInput = {
      RequestItems: {
        [TableName]: schoolClinicItems,
      },
    };

    await dynamoClient.send(new BatchWriteCommand(params));

    return newSchoolClinics;
  }

  async findAllByClinic(clinicId: string, options?: QueryCommandOptions) {
    const params: QueryCommandInput = {
      TableName,
      IndexName: "ClinicSchoolIndex",
      KeyConditionExpression: "clinicId = :clinicId",
      ExpressionAttributeValues: {
        ":clinicId": clinicId,
      },
      ...options,
    };

    const { Items } = await dynamoClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) return Items.map((item) => new SchoolClinicEntity(item));

    return [];
  }

  async deleteByBatch(dto: DeleteSchoolClinicDto) {
    const { schoolId, clinicIds } = dto;

    const deleteRequests = clinicIds.map((clinicId) => ({
      DeleteRequest: {
        Key: {
          schoolId,
          clinicId,
        },
      },
    }));

    const params: BatchWriteCommandInput = {
      RequestItems: {
        [TableName]: deleteRequests,
      },
    };

    await dynamoClient.send(new BatchWriteCommand(params));
  }

  async batchCreateBySchools(schools: SchoolEntity[]) {
    const newSchoolClinicsArray: SchoolClinicEntity[] = [];
    let count_schools = 0;

    for (const school of schools) {
      console.log(`\n${++count_schools} out of ${schools.length}`);
      console.log(`CREATING SCHOOL CLINIC FOR: ${school.id} - ${school.name}`);

      let count_clinics = 0;

      if (school.clinicIds && school.clinicIds!.length) {
        console.log(`CLINICS COUNT: ${school.clinicIds.length}`);

        const clinicBatches = this.chunk(school.clinicIds, 25);

        for (const clinicBatch of clinicBatches) {
          count_clinics += clinicBatch.length;
          console.log(`${count_clinics} clinics out of ${school.clinicIds.length}`);

          const newSchoolClinics = await this.createByBatch({ schoolId: school.id, clinicIds: clinicBatch });

          newSchoolClinicsArray.push(...newSchoolClinics);
        }
      } else {
        console.log(`THERE ARE NO CLINICS ASSIGNED FOR: ${school.id} - ${school.name}`);
      }
    }

    return { count: newSchoolClinicsArray.length, data: newSchoolClinicsArray };
  }

  private chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
  }
}

export const schoolClinicRepository = new SchoolClinicRepository();

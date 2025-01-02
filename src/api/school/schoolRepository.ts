import {
  DeleteCommand,
  type DeleteCommandInput,
  GetCommand,
  type GetCommandInput,
  PutCommand,
  type QueryCommandInput,
  UpdateCommand,
  type UpdateCommandInput,
  paginateQuery,
} from "@aws-sdk/lib-dynamodb";

import type { GetCommandOptions } from "@/common/types/dynamo-options.type";
import { nowISO } from "@/common/utils/date";
import { dynamoClient } from "@/common/utils/dynamo";
import { env } from "@/common/utils/envConfig";
import { HttpException } from "@/common/utils/http-exception";
import { capitalize } from "@/common/utils/string";
import { chunkObject, updateDataHelper, updateParentUpdatedAt } from "@/common/utils/update";
import type { RangeFilterDto } from "@/common/validators/common.validator";

import { PrerequisiteSchoolEntity } from "../prerequisite/entities/prerequisite-school.entity";
import { prerequisiteSchoolRepository } from "../prerequisite/repositories/prerequisite-school.repository";
import { prerequisiteRepository } from "../prerequisite/repositories/prerequisite.repository";
import type { AssignClinicDto } from "./dto/assign-clinic.dto";
import type { AssignPrerequisiteDto } from "./dto/assign-prerequisite.dto";
import type { CreateSchoolDto } from "./dto/create-school.dto";
import { FetchEnum, type GetSchoolsQueryDto } from "./dto/filter-school.dto";
import type { RemoveClinicDto } from "./dto/remove-clinic.dto";
import type { RemovePrerequisiteDto } from "./dto/remove-prerequisite.dto";
import type { UpdateSchoolDto } from "./dto/update-school.dto";
import { SchoolEntity } from "./entity/school.entity";

const TableName = env.DYNAMODB_TBL_SCHOOLS;

class SchoolRepository {
  async findAllSchoolsWithPaginated(body: GetSchoolsQueryDto) {
    const { search, sort, limit = 10, startingToken, fetch = FetchEnum.NO_TRASH, ...filters } = body;

    const params: QueryCommandInput = {
      TableName,
      Limit: limit,
      IndexName: "NameIndex",
      KeyConditionExpression: "#gsiKey = :gsiValue",
      ScanIndexForward: sort === "asc", // true for ascending, false for descending
      ProjectionExpression: "id, #name, title, thumbnail_url, excerpt, city, #state, prerequisiteIds, latitude, longitude, address",
    };

    const filterExpressions: string[] = ["#hide = :hide"];

    const expressionAttributeNames: { [key: string]: string } = {
      "#hide": "hide",
      "#gsiKey": "gsiPartitionKey",
      "#name": "name",
      "#state": "state",
    };

    const expressionAttributeValues: { [key: string]: any } = {
      ":hide": false,
      ":gsiValue": "ALL",
    };

    if (fetch === FetchEnum.NO_TRASH) {
      filterExpressions.push("(attribute_not_exists(deletedAt) OR deletedAt = :deletedAt)");
      expressionAttributeValues[":deletedAt"] = null;
    } else if (fetch === FetchEnum.TRASH_ONLY) {
      filterExpressions.push("(attribute_exists(deletedAt) AND deletedAt <> :deletedAt)");
      expressionAttributeValues[":deletedAt"] = null;
    }

    if (filters) {
      const {
        degree_type,
        program_structure,
        prerequisites,
        application_deadline,
        minimum_icu_experience,
        specialty_experience,
        minimum_gpa,
        in_state_tuition,
        out_state_tuition,
        not_required,
        nursing_cas,
        new_program,
        acceptance_rate,
        other,
        minimum_science_gpa,
        class_size_category,
        facilities,
        state,
      } = filters;

      const eitherOrHelperFilter = (data: string[], field_name: string) => {
        if (data && data.length > 0) {
          const { attribute_values, filter_expressions } = this.eitherOrHelper(data, field_name);
          Object.assign(expressionAttributeValues, attribute_values);
          filterExpressions.push(...filter_expressions);
        }
      };

      const checkBoxFilter = (arrayData: string[], value: boolean) => {
        arrayData.forEach((data) => {
          const key = `:${data}`;
          filterExpressions.push(`${data.toLowerCase()} = ${key}`);
          expressionAttributeValues[key] = value;
        });
      };

      const rangeFilter = (field_name: string, startKey: string, endKey: string, range: RangeFilterDto) => {
        filterExpressions.push(`${field_name} BETWEEN ${startKey} AND ${endKey}`);
        expressionAttributeValues[startKey] = range.start;
        expressionAttributeValues[endKey] = range.end;
      };

      // ? Checkbox filters (Either OR)
      if (degree_type && degree_type.length > 0) eitherOrHelperFilter(degree_type, "degree_type");
      if (program_structure && program_structure.length > 0) eitherOrHelperFilter(program_structure, "program_structure");
      if (state && state.length > 0) eitherOrHelperFilter(state, "#state");

      if (prerequisites && prerequisites.length > 0) {
        prerequisites.forEach((value: string) => {
          const key_attr_value = `:${value}`;
          filterExpressions.push(`NOT contains(prerequisiteIds, ${key_attr_value})`);
          expressionAttributeValues[key_attr_value] = value;
        });
      }
      if (application_deadline && application_deadline.length > 0) {
        const deadlineExpressions = application_deadline.map((month: string, index: number) => {
          const monthKey = `:applicationDeadline${index}`;
          expressionAttributeValues[monthKey] = month;
          return `contains(application_deadline, ${monthKey})`;
        });
        filterExpressions.push(`(${deadlineExpressions.join(" OR ")})`);
      }

      // ? Checkbox filters
      if (specialty_experience && specialty_experience.length > 0) checkBoxFilter(specialty_experience, true);
      if (not_required && not_required.length > 0) checkBoxFilter(not_required, false);
      if (other && other.length > 0) checkBoxFilter(other, true);
      if (facilities && facilities.length > 0) checkBoxFilter(facilities, true);

      // ? Range filters
      if (minimum_icu_experience) {
        const startKey = ":min_icu";
        const endKey = ":max_icu";
        rangeFilter("minimum_icu_experience", startKey, endKey, minimum_icu_experience);
      }
      if (minimum_gpa) {
        const startKey = ":min_minimum_gpa";
        const endKey = ":max_minimum_gpa";
        rangeFilter("minimum_gpa", startKey, endKey, minimum_gpa);
      }
      if (in_state_tuition) {
        const startKey = ":min_in_state";
        const endKey = ":max_in_state";
        rangeFilter("in_state_tuition", startKey, endKey, in_state_tuition);
      }
      if (out_state_tuition) {
        const startKey = ":min_out_state";
        const endKey = ":max_out_state";
        rangeFilter("out_state_tuition", startKey, endKey, out_state_tuition);
      }
      if (acceptance_rate) {
        const startKey = ":min_acceptance_rate";
        const endKey = ":max_acceptance_rate";
        rangeFilter("acceptance_rate", startKey, endKey, acceptance_rate);
      }
      if (minimum_science_gpa) {
        const startKey = ":min_minimum_science_gpa";
        const endKey = ":max_minimum_science_gpa";
        rangeFilter("minimum_science_gpa", startKey, endKey, minimum_science_gpa);
      }

      // ? Toggle filters (Boolean)
      if (nursing_cas !== undefined) {
        filterExpressions.push("nursing_cas = :nursing_cas");
        expressionAttributeValues[":nursing_cas"] = nursing_cas;
      }
      if (new_program !== undefined) {
        filterExpressions.push("new_program = :new_program");
        expressionAttributeValues[":new_program"] = new_program;
      }

      if (class_size_category) {
        filterExpressions.push("class_size_category = :class_size_category");
        expressionAttributeValues[":class_size_category"] = capitalize(class_size_category);
      }

      // * Add more conditions here if there are more filters
    }

    // ? Add search to params
    if (search) {
      const searchWords = search.split(/\s+/);
      if (searchWords.length > 0) {
        searchWords.forEach((word: string, index: number) => {
          const searchExpression = `contains(#search, :search${index})`;
          filterExpressions.push(searchExpression);
          expressionAttributeNames["#search"] = "search";
          expressionAttributeValues[`:search${index}`] = word;
        });
      }
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
    }
    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }
    if (Object.keys(expressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    console.log("Query Command Params: ", JSON.stringify(params, null, 2));

    // ? Use paginateQuery to handle pagination
    const paginator = paginateQuery({ client: dynamoClient, startingToken }, params);

    const accumulatedItems: any[] = [];
    let lastEvaluatedKey: any;

    for await (const page of paginator) {
      const remainingLimit = limit - accumulatedItems.length;
      accumulatedItems.push(...page.Items!.slice(0, remainingLimit));

      // ? If the accumulated items length is exactly the same with the limit
      if (remainingLimit % limit === 0 && accumulatedItems.length >= limit) {
        lastEvaluatedKey = page.LastEvaluatedKey;
        break;
      } else if (accumulatedItems.length >= limit) {
        break;
      }

      // ? Reassign the value for the last evaluated key if there's still remaining items to be pushed
      lastEvaluatedKey = page.LastEvaluatedKey;
    }

    const schools = accumulatedItems.map((item) => new SchoolEntity(item));

    return {
      lastEvaluatedKey,
      total: schools.length,
      data: schools,
    };
  }

  async create(dto: CreateSchoolDto) {
    const newSchoolEntity = new SchoolEntity(dto, { existing: false });

    const params = {
      TableName,
      Item: newSchoolEntity,
    };

    await dynamoClient.send(new PutCommand(params));

    return newSchoolEntity;
  }

  async update(id: string, updateDto: UpdateSchoolDto) {
    const chunks = chunkObject(updateDto, 100);
    let updatedAttributes: any = {};

    for (const chunk of chunks) {
      const { updateExpression, expressionAttributeNames, expressionAttributeValues } = updateDataHelper(chunk);

      const params: UpdateCommandInput = {
        TableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      };

      try {
        const { Attributes } = await dynamoClient.send(new UpdateCommand(params));
        updatedAttributes = { ...updatedAttributes, ...Attributes };
      } catch (error: any) {
        console.error("Update error:", error);
        throw new HttpException(`Failed to update school with id ${id}: ${error.message}`, 400);
      }
    }

    return new SchoolEntity(updatedAttributes);
  }

  async findOne(id: string, options?: GetCommandOptions) {
    const params: GetCommandInput = {
      TableName,
      Key: { id },
      ...options,
    };

    const { Item } = await dynamoClient.send(new GetCommand(params));

    const prerequisitesSchool = await prerequisiteSchoolRepository.findAllBySchool(id);
    const prerequisitesEntities = await prerequisiteRepository.findAllByIds(
      prerequisitesSchool.map((ps) => ps.prerequisiteId),
      { ProjectionExpression: "prerequisiteId, label" },
    );

    const prerequisites = prerequisitesSchool.map((ps) => {
      const foundPrerequisite = prerequisitesEntities.find((p) => p.prerequisiteId === ps.prerequisiteId);
      return new PrerequisiteSchoolEntity({ ...ps, label: foundPrerequisite!.label });
    });

    return Item ? new SchoolEntity({ ...Item, prerequisites }) : null;
  }

  async assignClinic(dto: AssignClinicDto) {
    await this.initializeClinicIdsIfNull(dto.id);

    const params = this.assignOrRemoveClinicParams(dto, "ADD");

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    // ? Update School's updatedAt property
    await updateParentUpdatedAt(env.DYNAMODB_TBL_SCHOOLS, { id: dto.id });

    return new SchoolEntity(Attributes!);
  }

  async removeClinic(dto: RemoveClinicDto) {
    const params = this.assignOrRemoveClinicParams(dto, "DELETE");

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    // ? Update School's updatedAt property
    await updateParentUpdatedAt(env.DYNAMODB_TBL_SCHOOLS, { id: dto.id });

    return new SchoolEntity(Attributes!);
  }

  async assignPrerequisite(dto: AssignPrerequisiteDto) {
    const params = this.assignOrRemovePrerequisiteParams(dto, "ADD");

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    // ? Update School's updatedAt property
    await updateParentUpdatedAt(env.DYNAMODB_TBL_SCHOOLS, { id: dto.id });

    return new SchoolEntity(Attributes!);
  }

  async removePrerequisite(dto: RemovePrerequisiteDto) {
    const { id, prerequisites } = dto;

    // * Remove from SCHOOLS's prerequisiteIds field by NAME
    const prerequisiteIds = new Set(prerequisites.map((p) => p.name));

    const params = this.assignOrRemovePrerequisiteParams({ id, prerequisiteIds }, "DELETE");

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    // ? Update School's updatedAt property
    await updateParentUpdatedAt(env.DYNAMODB_TBL_SCHOOLS, { id: dto.id });

    return new SchoolEntity(Attributes!);
  }

  async softDelete(id: string) {
    const params: UpdateCommandInput = {
      TableName,
      Key: { id },
      UpdateExpression: "SET deletedAt = :deletedAt",
      ExpressionAttributeValues: {
        ":deletedAt": nowISO(),
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new SchoolEntity(Attributes!);
  }

  async restore(id: string) {
    const params: UpdateCommandInput = {
      TableName,
      Key: { id },
      UpdateExpression: "SET deletedAt = :deletedAt",
      ExpressionAttributeValues: {
        ":deletedAt": null,
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoClient.send(new UpdateCommand(params));

    return new SchoolEntity(Attributes!);
  }

  async forceRemove(id: string) {
    const params: DeleteCommandInput = {
      TableName,
      Key: { id },
    };

    await dynamoClient.send(new DeleteCommand(params));
  }

  private assignOrRemoveClinicParams({ id, clinicIds }: AssignClinicDto | RemoveClinicDto, action: "ADD" | "DELETE") {
    const params: UpdateCommandInput = {
      TableName,
      Key: { id },
      UpdateExpression: `${action} clinicIds :clinicIds`,
      ExpressionAttributeValues: {
        ":clinicIds": clinicIds,
      },
      ReturnValues: "UPDATED_NEW",
    };

    return params;
  }

  private async initializeClinicIdsIfNull(id: string) {
    const params: UpdateCommandInput = {
      TableName,
      Key: { id },
      ConditionExpression: "attribute_exists(clinicIds) AND clinicIds = :null",
      UpdateExpression: "REMOVE clinicIds",
      ExpressionAttributeValues: {
        ":null": null,
      },
    };

    try {
      await dynamoClient.send(new UpdateCommand(params));
    } catch (error) {
      // * Do not throw an error
    }
  }

  private assignOrRemovePrerequisiteParams({ id, prerequisiteIds }: AssignPrerequisiteDto, action: "ADD" | "DELETE") {
    const params: UpdateCommandInput = {
      TableName,
      Key: { id },
      UpdateExpression: `${action} prerequisiteIds :prerequisiteIds`,
      ExpressionAttributeValues: {
        ":prerequisiteIds": prerequisiteIds,
      },
      ReturnValues: "UPDATED_NEW",
    };

    return params;
  }

  private eitherOrHelper(data: string[], key: string) {
    const dataExpressions: string[] = [];
    const attribute_values: any = {};
    const filter_expressions: string[] = [];

    data.forEach((val) => {
      let value = `:${val.replace(/\s+/g, "_")}`;

      if (key === "#state") {
        value = `:${val.split(" ").join("").replace("-", "")}`; // * e.g.: "FL - Florida" -> "FLFlorida"
      }

      dataExpressions.push(`${key} = ${value}`);
      attribute_values[value] = val;
    });

    if (dataExpressions.length > 0) {
      filter_expressions.push(`(${dataExpressions.join(" OR ")})`);
    }

    return { attribute_values, filter_expressions };
  }
}

export const schoolRepository = new SchoolRepository();

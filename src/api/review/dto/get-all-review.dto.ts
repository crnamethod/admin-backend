import { z } from "zod";

import { StatusReviewEnum } from "@/common/enum/review.enum";

export type FindAllReviewDto = z.infer<typeof FindAllReviewSchema>;

export const FindAllReviewSchema = z
  .object({
    sort_by_date: z.enum(["asc", "desc"]).optional(),
    limit: z.coerce.number().optional(),
    startingToken: z
      .any()
      .transform((val) => JSON.parse(val))
      .optional(),
    search: z
      .string()
      .transform((val) => val.toLowerCase())
      .optional(),
    startDate: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    endDate: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    schoolId: z.string().optional(),
    userId: z.string().optional(),
    rating: z.coerce.number().optional(),
    status: z.nativeEnum(StatusReviewEnum).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.schoolId && data.userId) {
      ctx.addIssue({
        code: "custom",
        message: `Only one of 'schoolId' or 'userId' should be present.`,
      });
    }

    if ((data.startDate && !data.endDate) || (!data.startDate && data.endDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate", "endDate"],
        message: "are required if either is provided.",
      });
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "should not be greater than endDate.",
      });
    }
  });

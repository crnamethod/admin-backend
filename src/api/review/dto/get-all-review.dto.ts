import { z } from "zod";

import { StatusReviewEnum } from "@/common/enum/review.enum";

export const BaseFindAllReviewSchema = z
  .object({
    sort_by_date: z.enum(["asc", "desc"]).optional(),
    sort_by_rating: z.enum(["asc", "desc"]).optional(),
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
    email: z.string().optional(),
    rating: z.coerce.number().optional(),
    status: z.nativeEnum(StatusReviewEnum).optional(),
  })
  .strict();

export type FindAllReviewDto = z.infer<typeof FindAllReviewSchema>;

export const FindAllReviewSchema = BaseFindAllReviewSchema.superRefine((data, ctx) => {
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

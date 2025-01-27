import { z } from "zod";

import { BaseFindAllReviewSchema } from "@/api/review/dto/get-all-review.dto";

export type FindAllClinicReviewDto = z.infer<typeof FindAllClinicReviewSchema>;

export const FindAllClinicReviewSchema = BaseFindAllReviewSchema.omit({ schoolId: true })
  .extend({
    clinicId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.clinicId && data.userId) {
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

import { z } from "zod";

export type RangeFilterDto = z.infer<typeof startEndFilter>;

const startEndFilter = z.object({
  start: z.number().min(0),
  end: z.number().min(0),
});

export const rangeObject = z
  .string()
  .transform((val) => {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.log(e);
      throw new Error("Invalid JSON format");
    }
  })
  .pipe(startEndFilter);

export const transformArrayObject = z.string().transform((val): string[] => {
  try {
    return JSON.parse(val);
  } catch (e) {
    console.log(e);
    return [];
  }
});

export const tranformBooleanObject = z.preprocess((value) => {
  let newValue: any = value;

  if (typeof value === "string") newValue = value.toLowerCase();
  if (newValue === "true" || newValue === "1") return true;
  if (newValue === "false" || newValue === "0") return false;
  return newValue;
}, z.boolean());

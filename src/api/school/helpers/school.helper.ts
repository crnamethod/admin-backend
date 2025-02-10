import { SchoolEntity } from "../entity/school.entity";
import { RegionEnum } from "../enum/school.enum";

const northeast = [
  "Connecticut",
  "Delaware",
  "Maine",
  "Massachusetts",
  "New Hampshire",
  "Rhode Island",
  "Vermont",
  "New Jersey",
  "New York",
  "Pennsylvania",
  "D.C",
  "Maryland",
];

const midwest = ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"];

const southeast = [
  "Alabama",
  "Arkansas",
  "Florida",
  "Georgia",
  "Kentucky",
  "Louisiana",
  "Mississippi",
  "North Carolina",
  "South Carolina",
  "Tennessee",
  "Virginia",
  "West Virginia",
];

const southwest = ["Arizona", "New Mexico", "Oklahoma", "Texas"];
const west = ["Alaska", "California", "Colorado", "Hawaii", "Idaho", "Montana", "Nevada", "Oregon", "Utah", "Washington", "Wyoming"];

export const regionHelper = async (state: string) => {
  let region: RegionEnum | null = null;

  if (state && state !== "") {
    const transformedState = state.split("-")[1].trim();

    if (northeast.includes(transformedState)) region = RegionEnum.NORTHEAST;
    else if (midwest.includes(transformedState)) region = RegionEnum.MIDWEST;
    else if (southeast.includes(transformedState)) region = RegionEnum.SOUTHEAST;
    else if (southwest.includes(transformedState)) region = RegionEnum.SOUTHWEST;
    else if (west.includes(transformedState)) region = RegionEnum.WEST;
    else region = RegionEnum.CARRIBEAN;
  }

  return region;
};

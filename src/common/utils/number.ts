export const calculatePercentage = (count: number, total: number) => (total > 0 ? convertToDecimal((count / total) * 100) : 0);

export const calculateAverage = (count: number, total: number) => (total > 0 ? convertToDecimal(count / total) : 0);

const convertToDecimal = (num: number, decimal_place = 2) => {
  return Number(num.toFixed(decimal_place));
};

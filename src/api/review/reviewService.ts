import { Review } from "./reviewModel";
import { ReviewPerSchool, listReview, listReviews } from "./reviewRepository";

interface GetReviewsQuery {
  limit?: number; // Optional number
  reviewId?: string; // Optional string
}

export const getReviews = async (query: GetReviewsQuery) => {
  const { limit, reviewId: lastReviewId } = query;
  const parsedLimit = limit ? Number(limit) : undefined;

  const { reviews, lastEvaluatedKey } = await listReviews(
    lastReviewId,
    parsedLimit
  );

  return { reviews, lastEvaluatedKey };
};

export const getReview = async (reviewId: string) => {
  const review = await listReview(reviewId);

  return review;
};
export const getReviewPerSchool = async (schoolId: string) => {
  const review = await ReviewPerSchool(schoolId);

  return review;
};

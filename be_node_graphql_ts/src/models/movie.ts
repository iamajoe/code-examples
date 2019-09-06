// --------------------------------
// variables

export type IMovie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  auth_rating?: string;

  actorIds: string[];
};

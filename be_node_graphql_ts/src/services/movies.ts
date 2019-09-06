import { IMovie } from '../models/movie';
import { IUser } from '../models/user';

// --------------------------------
// variables

// TODO: we should use a database for this
const movies: IMovie[] = [
  { id: '1', title: 'ABC', year: 2000, rating: 2, actorIds: [] },
  { id: '2', title: 'DEF', year: 2001, rating: 3, actorIds: ['1'] },
  { id: '3', title: 'GHI', year: 2002, rating: 4, actorIds: ['2', '3'] },
];

// --------------------------------
// methods

/**
 * Get movies by ids
 * TODO: retrieve data from DB
 */
export const getMovies = (ids: string[], authUser: IUser|null = null) => {
  // TODO: retrieve data from DB
  const resultMovies = (ids == null || ids.length === 0) ? movies : movies.filter((movie) => {
    const found = ids.filter(id => id === movie.id);
    return found.length > 0;
  });

  return resultMovies
  .map((movie) => {
    // should only send the next when auth!
    if (authUser == null) {
      return movie;
    }

    // since we're doing a modification we need to enforce a clone
    return {
      ...movie,
      // TOREAD: should we really be doing this here? requirements don't specify so...
      // DEV: auth rating needs to be a random string between 5.0-9.0
      auth_rating: `${(Math.random() * (5 - 9) + 9).toFixed(1)}`
    };
  });
};

/**
 * Get movie by id
 */
export const getMovie = (id: string, authUser: IUser|null = null) => getMovies([id], authUser)[0];

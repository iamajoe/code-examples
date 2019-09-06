import { IDirector } from '../models/director';

// --------------------------------
// variables

// TODO: we should use a database for this
const directors: IDirector[] = [
  { id: '1', name: 'ABC', birthday: `${(new Date()).getTime()}`, country: 'EN' },
  { id: '2', name: 'DEF', birthday: `${(new Date()).getTime()}`, country: 'AD' },
  { id: '3', name: 'GHI', birthday: `${(new Date()).getTime()}`, country: 'PT' },
];

// --------------------------------
// methods

/**
 * Get directors by ids
 * TODO: retrieve data from DB
 */
export const getDirectors = (ids: string[] = []) => directors.filter((director) => {
  const found = ids.filter(id => id === director.id);
  return found.length > 0;
});

/**
 * Get director by id
 */
export const getDirector = (id: string) => getDirectors([id])[0];

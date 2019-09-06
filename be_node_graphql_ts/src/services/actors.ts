import { IActor } from '../models/actor';

// --------------------------------
// variables

// TODO: we should use a database for this
const actors: IActor[] = [
  { id: '1', name: 'ABC', birthday: `${(new Date()).getTime()}`, country: 'EN', directorIds: [] },
  { id: '2', name: 'DEF', birthday: `${(new Date()).getTime()}`, country: 'AD', directorIds: ['1'] },
  { id: '3', name: 'GHI', birthday: `${(new Date()).getTime()}`, country: 'PT', directorIds: ['2', '3'] },
];

// --------------------------------
// methods

/**
 * Get actors by ids
 * TODO: retrieve data from DB
 */
export const getActors = (ids: string[] = []) => actors.filter((actor) => {
  const found = ids.filter(id => id === actor.id);
  return found.length > 0;
});

/**
 * Get actor by id
 */
export const getActor = (id: string) => getActors([id])[0];

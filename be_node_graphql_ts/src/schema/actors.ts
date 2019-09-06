import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { DirectorType } from './directors';
import { getActor } from '../services/actors';
import { getDirectors } from '../services/directors';

// --------------------------------
// variables

export const ActorType = new GraphQLObjectType({
  name: 'Actor',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    birthday: { type: GraphQLString },
    country: { type: GraphQLString },

    // TOREAD: the placement for this directors seemed like a bug on the requirements.
    //         it doesn't make much sense to have directors inside actors but since
    //         you might be copying from the markdown i still set it here
    directors: {
      type: new GraphQLList(DirectorType),
      resolve: (parent, args) => getDirectors(parent.directorIds)
    }
  })
});

export const queryFields = {
  actor: {
    type: ActorType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: (parent, args) => getActor(args.id)
  },
};

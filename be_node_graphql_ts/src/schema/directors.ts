import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { getDirector } from '../services/directors';

// --------------------------------
// variables

export const DirectorType = new GraphQLObjectType({
  name: 'Director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    birthday: { type: GraphQLString },
    country: { type: GraphQLString },
  })
});

export const queryFields = {
  director: {
    type: DirectorType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: (parent, args) => getDirector(args.id)
  },
};

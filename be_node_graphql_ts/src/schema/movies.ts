import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { ActorType } from './actors';
import { getMovie, getMovies } from '../services/movies';
import { getActors } from '../services/actors';

// --------------------------------
// variables

export const MovieType = new GraphQLObjectType({
  name: 'Movie',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    year: { type: GraphQLInt },
    rating: { type: GraphQLInt },

    auth_rating: { type: GraphQLString },

    actors: {
      type: new GraphQLList(ActorType),
      resolve: (parent, args) => getActors(parent.actorIds)
    }
  })
});

export const queryFields = {
  movie: {
    type: MovieType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: (parent, args, context, info) => getMovie(args.id, context.state.authUser)
  },
  movies: {
    type: new GraphQLList(MovieType),
    args: { ids: { type: new GraphQLList(GraphQLID) } },
    resolve: (parent, args, context, info) => getMovies(args.ids, context.state.authUser)
  }
};

import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { queryFields as usersQueryFields, mutationFields as usersMutationFields } from './users';
import { queryFields as directorsQueryFields } from './directors';
import { queryFields as actorsQueryFields } from './actors';
import { queryFields as moviesQueryFields } from './movies';

// --------------------------------
// variables

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    ...usersQueryFields,
    ...directorsQueryFields,
    ...actorsQueryFields,
    ...moviesQueryFields,
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...usersMutationFields,
  }
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

export default schema;

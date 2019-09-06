import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
} from 'graphql';
import { getUser, createUser, login } from '../services/users';

// --------------------------------
// variables

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
  })
});

export const UserAndTokenType = new GraphQLObjectType({
  name: 'UserAndTokenType',
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType },
  })
});

export const queryFields = {
  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve: (parent, args) => getUser(args.id)
  },
};

export const mutationFields = {
  createUser: {
    type: UserAndTokenType,
    args: {
      // TOREAD: these should be not nullable they're required
      //         but since on the requirements you are requesting
      //         with String instead of String!
      // username: { type: new GraphQLNonNull(GraphQLString) },
      // password: { type: new GraphQLNonNull(GraphQLString) },
      username: { type: GraphQLString },
      password: { type: GraphQLString },
    },
    resolve: (parent, args) => {
      const { username, password } = args;

      return createUser(username, password)
      .then(() => login(username, password));
    }
  },
  login: {
    type: UserAndTokenType,
    args: {
      // TOREAD: these should be not nullable they're required
      //         but since on the requirements you are requesting
      //         with String instead of String!
      // username: { type: new GraphQLNonNull(GraphQLString) },
      // password: { type: new GraphQLNonNull(GraphQLString) },
      username: { type: GraphQLString },
      password: { type: GraphQLString },
    },
    resolve: (parent, args) => login(args.username, args.password)
  },
};

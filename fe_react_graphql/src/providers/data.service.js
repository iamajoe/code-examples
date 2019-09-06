import ApolloClient from 'apollo-boost';
import * as config from '../config/default';

const client = new ApolloClient({
  uri: config.api
});

export default client;
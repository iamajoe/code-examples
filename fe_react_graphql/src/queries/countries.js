import { gql } from 'apollo-boost';

// --------------------------------
// variables

export const getCountriesQuery = gql`
{
  countries {
    code
    name
    continent {
      code
      name
    }
    languages {
      code
      name
      native
    }
  }
}
`;

export const getCountrySingle = gql`
  query getCountry($code: String) {
    country(code: $code) {
      name
      currency
      phone
    }
  }
`;

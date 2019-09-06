import React from 'react';
import { Link } from "react-router-dom";
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import * as config from '../../config/default';
import { getCountriesQuery } from '../../queries/countries';
import { Button } from '../../components/Button';

// --------------------------------
// components

// Table is a the style for the countries list table
const Table = styled.table`
  font-size: 0.9em;
  border-collapse: collapse;
  text-align: left;

  th,
  td {
    padding: ${config.appPadding}em;
  }

  p {
    margin: 0;
  }

  small {
    color: hsla(200, 7%, 1%, 0.6);
  }

  thead {
    font-size: 0.8em;
    color: white;
    background-color: hsla(200, 7%, 1%, 0.6);
  }

  tr + tr {
    border-top: 1px solid hsla(200, 7%, 1%, 0.1);
  }
`;

/**
 * PageCountriesList is the general component for this specific page
 */
const PageCountriesList = () => {
  const { loading, error, data } = useQuery(getCountriesQuery);

  if (loading) { return <div>Loading...</div>; }
  if (error) { return <div>Error: <pre>{JSON.stringify(error, null, 2)}</pre></div>; }

  return (
    <div>
      <h2>Countries list</h2>
      <Table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Language</th>
            <th>Continent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.countries.map((country) => (
            <tr key={country.code}>
              <td>{country.name}</td>
              <td>
                <p>{country.languages.map(lang => lang.native).join(', ')}</p>
                <small>{country.languages.map(lang => lang.name).join(', ')}</small>
              </td>
              <td>{country.continent.name}</td>
              <td><Link to={`/countries/${country.code.toLowerCase()}`}><Button>Go in</Button></Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export { PageCountriesList };

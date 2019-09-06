import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { getCountrySingle } from '../../queries/countries';

// --------------------------------
// components

/**
 * PageCountriesSingle is the general component for this specific page
 * @param {*} props
 */
const PageCountriesSingle = (props) => {
  const countryCode = props.match.params.code.toUpperCase();
  const { loading, error, data } = useQuery(getCountrySingle, {
    variables: { code: countryCode }
  });

  if (loading) { return <div>Loading...</div>; }
  if (error) { return <div>Error: <pre>{JSON.stringify(error, null, 2)}</pre></div>; }

  const country = data.country;

  return (
    <div>
      <h2>{country.name}</h2>

      <div><strong>Currency:</strong> <span>{country.currency}</span></div>
      <div><strong>Area code:</strong> <span>{country.phone}</span></div>
    </div>
  );
};

export { PageCountriesSingle };

import styled from 'styled-components';
import * as config from '../config/default';

// --------------------------------
// components

/**
 * Button is the component going out
 */
const Button = styled.button`
  margin: 0;
  padding: 0.25em 1em;
  background: transparent;
  font-size: 1em;
  border-radius: 3px;
  color: ${config.appColor};
  border: 2px solid ${config.appColor};
  transition: 0.3s all ease-out;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${config.appColor};
    color: white;
  }
`;

export { Button };
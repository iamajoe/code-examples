import React from 'react';
import { NavLink } from "react-router-dom";
import styled from 'styled-components';
import * as config from '../config/default';

// --------------------------------
// variables

const BUTTON_PADDING = 0.2;

// --------------------------------
// components

// Nav is a section created specifically for header styles
const Nav = styled.nav`
  background-color: ${config.appColor};
  color: white;

  ul {
    margin: 0;
    padding: 0 ${config.appPadding - BUTTON_PADDING}em;
  }

  li {
    display: inline-block;
    vertical-align: middle;

    + li {
      margin-left: 10px;
    }
  }

  a {
    display: block;
    padding: 0.6em ${BUTTON_PADDING}em;
    color: inherit;
    text-decoration: none;
    transition: 0.2s all ease-out;
  }

  a:hover,
  .is-active {
    color: #ccc;
  }
`;

/**
 * Header is the general component for this specific page
 */
const Header = () => (
  <Nav>
    <ul>
      <li>
        <NavLink exact={true} activeClassName='is-active' to='/'>Home</NavLink>
      </li>
      <li>
        <NavLink activeClassName='is-active' to='/countries'>Countries</NavLink>
      </li>
    </ul>
  </Nav>
);

export { Header };

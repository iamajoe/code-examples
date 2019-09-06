import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ApolloProvider } from '@apollo/react-hooks';
import styled, { createGlobalStyle } from 'styled-components';
import * as config from './config/default';

// data related
import dataClient from './providers/data.service';

// import components
import { Header } from './components/Header';
import { PageDashboard } from './pages/Dashboard/Dashboard';
import { PageCountriesList } from './pages/Countries/CountriesList';
import { PageCountriesSingle } from './pages/Countries/CountriesSingle';

// --------------------------------
// variables

// --------------------------------
// components

// GlobalStyle sets a global app style
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    line-height: 1.2;
    font-size: ${config.appBaseFontSize}px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
      sans-serif;
    color: black;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// PageWrapper is a section created specifically for page bootstrap styles
const PageWrapper = styled.div`
  padding: 0.5em ${config.appPadding}em;
`;

// App is the main component that bootstraps the app
const App = () => <React.Fragment>
  <GlobalStyle />
  <ApolloProvider client={dataClient}>
    <Router>
      <Header></Header>
      <PageWrapper>
        <Route path="/" exact component={PageDashboard} />
        <Route exact path="/countries/" component={PageCountriesList} />
        <Route path="/countries/:code" component={PageCountriesSingle} />
      </PageWrapper>
    </Router>
  </ApolloProvider>
</React.Fragment>;

export default App;

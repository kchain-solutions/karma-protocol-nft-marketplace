import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import { BrowserRouter as Router } from 'react-router-dom';
import GlobalStateProvider from './provider/GlobalStateProvider';
import React from "react";
import { Container } from '@mui/material';
import Main from './Main';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from './style/muiStyle';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPH_ENDPOINT,
  cache: new InMemoryCache()
});

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <GlobalStateProvider>
          <ApolloProvider client={client}>
            <Router>
              <Header />
              <Container sx={{ marginTop: 4 }}>
                <Main />
              </Container>
              <Footer />
            </Router>
          </ApolloProvider>
        </GlobalStateProvider>
      </ThemeProvider>
    </>
  );
}

export default App;

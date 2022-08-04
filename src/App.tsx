import React from 'react';
import { Router, Route, Switch } from "react-router-dom";
import { Container, Stack } from '@mui/material';
import history from "./routerHistory";
// import {
//   CreateFarm
// } from "@cryption/dapp-factory-sdk";
import useEagerConnect from "./hooks/useEagerConnect";
import Home from './views/Home';
import CreateFarm from './views/CreateFarm';
import quickLogo from './images/quickLogo.png';
import PoweredByCryptionNetwork from './images/PoweredByCryptionNetwork.png';
import './App.css';

function App() {
  useEagerConnect();
  return (
    <Container maxWidth="lg">
      <Stack direction="row" justifyContent="space-between" sx={{marginBottom: '20px', marginTop: '20px'}}>
        <img src={quickLogo} alt="quick logo" width="150px" />
        <img src={PoweredByCryptionNetwork} alt="Dapp factory" width="200px" />
      </Stack>
      <Router history={history}>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/create" exact>
            <CreateFarm />
          </Route>
        </Switch>
      </Router>
    </Container>
  );
}

export default App;

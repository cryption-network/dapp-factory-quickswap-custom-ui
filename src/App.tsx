import React from 'react';
import { Router, Route, Switch } from "react-router-dom";
import { connectorLocalStorageKey, ConnectorNames } from "cryption-uikit-v2";
import { Container, Stack, Button } from '@mui/material';
import history from "./routerHistory";
// import {
//   CreateFarm
// } from "@cryption/dapp-factory-sdk";
import useActiveWeb3React from "./hooks";
import useEagerConnect from "./hooks/useEagerConnect";
import useAuth from "./hooks/useAuth";
import Home from './views/Home';
import CreateFarm from './views/CreateFarm';
import quickLogo from './images/quickLogo.png';
import PoweredByCryptionNetwork from './images/PoweredByCryptionNetwork.png';
import './App.css';

function App() {
  useEagerConnect();
  const { login } = useAuth();
  const { account } = useActiveWeb3React();
  const loginToAccount = () => {
    if (account === undefined || account === null) {
      const connectorId = window.localStorage.getItem(
        connectorLocalStorageKey
      ) as ConnectorNames;

      // Disable eager connect for BSC Wallet. Currently the BSC Wallet extension does not inject BinanceChain
      // into the Window object in time causing it to throw an error
      // TODO: Figure out an elegant way to listen for when the BinanceChain object is ready
      if (connectorId && connectorId) {
        login(connectorId);
      }
    }
  }
  return (
    <Container maxWidth="lg">
      <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '20px', marginTop: '20px' }}>
        <img src={quickLogo} alt="quick logo" width="150px" />
        <Stack direction="row" spacing={3} justifyContent="space-between">
          <Button
            onClick={loginToAccount}
            sx={{
              backgroundImage: 'linear-gradient(105deg,#448aff 3%,#004ce6)',
              color: '#ffffff',
              height: '48px',
              fontFamily: 'Inter',
              fontWeight: '700',
              padding: '6px 18px',
              borderRadius: '30px',
            }}
          >
            {account ? `${account.slice(0, 10)}...${account.slice(account.length - 5)}` : 'Connect To Wallet'}
          </Button>
          <img src={PoweredByCryptionNetwork} alt="Dapp factory" width="200px" />
        </Stack>
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

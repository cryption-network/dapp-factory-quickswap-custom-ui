import React, { useEffect, useState } from 'react';
import { Router, Route, Switch } from "react-router-dom";
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Container, Stack, Button } from '@mui/material';
import history from "./routerHistory";
// import {
//   CreateFarm
// } from "@cryption/dapp-factory-sdk";
import { injected, walletlink } from './connectors';
import useEagerConnect from "./hooks/useEagerConnect";
import Home from './views/Home';
import CreateFarm from './views/CreateFarm';
import quickLogo from './images/quickLogo.png';
import Modal from './components/Modal';
import { getWalletKeys, shortenAddress } from './utils'
import PoweredByCryptionNetwork from './images/PoweredByCryptionNetwork.png';
import './App.css';
import { SUPPORTED_WALLETS } from './config';
import styled from 'styled-components';

const ConnectedWalletDiv = styled.div`
  padding: 16px;
  margin-top: 16px;
  border-radius: 10px;
  min-width: 300px;
  font-family: 'Inter';
  background-color: #232734;
`;
const GreenDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  margin-right: 8px;
  background-color: #0fc679;
`;
const StyledLink = styled.a`
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  font-weight: 700;
  padding: 0 24px;
  overflow: hidden;
  text-decoration: none;
  margin-right: 12px;
  color: #696c80;
`;
function App() {
  useEagerConnect()
  const [loginModal, toggleLoginModal] = useState(false);
  const [showLoginOptions, toggleLoginOptions] = useState(false);
  const {
    account,
    connector,
    activate,
  } = useWeb3React();
  console.log({ connector });
  const loginToAccount = () => {
    if (account === undefined || account === null) {
      toggleLoginOptions(true)
    } else {
      toggleLoginModal(true)
    }
  }
  const formatConnectorName = () => {
    const name = getWalletKeys(connector).map(
      (k) => SUPPORTED_WALLETS[k].name,
    )[0];
    return (
      <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'Inter' }}>Connected with {name}</span>
    );
  }
  useEffect(() => {
    if (window && window.ethereum) {
      window.ethereum.on("chainChanged", async () => {
        window.location.reload();
      });
    }
  }, []);
  const connectWallet = async (connector: AbstractConnector | undefined) => {
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (SUPPORTED_WALLETS[key].name);
      }
      return true;
    });

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          console.log('errir', error);
        }
      });
  };
  const icon = getWalletKeys(connector).map(
    (k) => SUPPORTED_WALLETS[k].iconName,
  )[0];
  const getOptions = () => {
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      return (
        <ConnectedWalletDiv key={`connect-${key}`} style={{ cursor: 'pointer' }} onClick={() => connectWallet(option.connector)}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <img src={option.iconName} alt={'Icon'} width={24} />
              <p style={{ marginLeft: '8px', fontSize: '16px', fontWeight: '500', fontFamily: 'Inter' }}>{option.name}</p>
            </Stack>
            {option.connector === connector &&
              <Stack direction="row" alignItems="center">
                <GreenDot />
                <p style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter' }}>Connected</p>
              </Stack>
            }
          </Stack>
        </ConnectedWalletDiv>
      )
    })
  }
  return (
    <Container maxWidth="xl">
      <Modal open={loginModal} title="Account" onClose={() => toggleLoginModal(false)}>
        <div>
          <ConnectedWalletDiv>
            <Stack direction="row" justifyContent="space-between">
              {formatConnectorName()}
              <Stack direction="row" alignItems="center" spacing={2}>
                {connector !== injected &&
                  connector !== walletlink &&
                  <span
                    style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'Inter', cursor: 'pointer', marginRight: '10px', marginLeft: '20px' }}
                    onClick={() => {
                      (connector as any).close();
                      toggleLoginModal(false)
                      toggleLoginOptions(true)
                    }}
                  >
                    Disconnect
                  </span>
                }
                <span
                  style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'Inter', cursor: 'pointer' }}
                  onClick={() => {
                    toggleLoginModal(false)
                    toggleLoginOptions(true)
                  }}
                >
                  Change
                </span>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ marginTop: '20px' }}>
              <img src={icon} width={24} alt='wallet icon' />
              <h5 style={{ marginLeft: 8, fontSize: '20px' }} id='web3-account-identifier-row'>
                {account && shortenAddress(account)}
              </h5>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ marginTop: '20px' }} justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <ContentCopyIcon sx={{ fontSize: '18px' }} />
                <h5 style={{ marginLeft: 8, fontSize: '14px' }} id='web3-account-identifier-row'>
                  Copy Address
                </h5>
              </Stack>
              <a href={`https://polygonscan.com/address/${account}`} target="_blank" rel="noreferrer">
                View on Block Explorer
              </a>
            </Stack>
          </ConnectedWalletDiv>
        </div>
      </Modal>
      <Modal open={showLoginOptions} title="Connect Wallet" onClose={() => toggleLoginOptions(false)}>
        <div>
          {getOptions()}
        </div>
      </Modal>
      <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '20px', marginTop: '20px', position: 'relative', zIndex:2 }}>
        <img src={quickLogo} alt="quick logo" width="150px" />
        <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
          <StyledLink href='https://quickswap.exchange/#/swap' target="_blank">Swap</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/pools'>Pool</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/farm'>Farm</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/dragons'>Dragon’s Lair</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/convert'>Convert</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/prdt'>Predictions</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/analytics'>Analytics</StyledLink>
        </Stack>
        <Stack direction="row" spacing={3} justifyContent="space-between">
          {account ?
            <Button
              onClick={loginToAccount}
              sx={{
                border: '1px solid #3e4252',
                color: '#c7cad9',
                height: '48px',
                cursor: 'pointer',
                padding: '6px 18px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {shortenAddress(account)}
            </Button>
            :
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
              Connect To Wallet
            </Button>
          }
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
      {false && <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
        <img src={PoweredByCryptionNetwork} alt="Dapp factory" width="200px" />
      </div>}
    </Container>
  );
}

export default App;

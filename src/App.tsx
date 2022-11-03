import React, { useEffect, useState } from 'react';
import { Router, Route, Switch } from "react-router-dom";
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Popover from '@mui/material/Popover';
import { styled as muiStyled } from '@mui/material/styles';
import { Container, Stack, Button } from '@mui/material';
import { Text } from 'cryption-uikit-v2';
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
import MetamaskIcon from "./images/metamask.png";
import styled from 'styled-components';

const MuiPopover = muiStyled(Popover)({
  '&.MuiPaper-root': {
    backgroundColor: '#106ba3',
  },
});

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
const SwitchButton = styled.button`
        width: 100%;
    height: 46px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    border: 1px solid #448aff;
    color: #448aff;
    font-size: 16px;
    font-weight: 600;
    background: transparent;
    font-family: Inter;
    margin-top: 20px;
`

function App() {
  useEagerConnect()
  const [loginModal, toggleLoginModal] = useState(false);
  const [showLoginOptions, toggleLoginOptions] = useState(false);
  const {
    account,
    chainId,
    connector,
    activate,
  } = useWeb3React();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
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
          console.error('errir', error);
        }
      });
  };
  let icon = getWalletKeys(connector).map(
    (k) => SUPPORTED_WALLETS[k].iconName,
  )[0];
  if (icon === undefined) {
    icon = MetamaskIcon;
  }
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
  const swtichToPolygon = async () => {
    if (window.ethereum) {
      try {
        const chainIdFallback = parseInt("137", 10);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainIdFallback.toString(16)}` }],
        });
        return true;
      } catch (error) {
        if (error.code === 4902) {
          // @ts-ignore
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chainIdFallback.toString(16)}`,
                chainName: "Matic",
                nativeCurrency: {
                  name: NATIVE_TOKENS[chainIdFallback].name,
                  symbol: NATIVE_TOKENS[chainIdFallback].symbol,
                  decimals: NATIVE_TOKENS[chainIdFallback].decimals,
                },
                // @ts-ignore
                rpcUrls: nodes[chainIdFallback],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          });
          return true;
        }
        console.error(error);
        return false;
      }
    }
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
      <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '20px', marginTop: '20px', position: 'relative', zIndex: 2 }}>
        <StyledLink href="/">
          <img src={quickLogo} alt="quick logo" width="150px" />
        </StyledLink>
        <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
          <StyledLink href='https://quickswap.exchange/#/swap' target="_blank">Swap</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/pools'>Pool</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/farm'>Farm</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/dragons'>Dragon’s Lair</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/convert'>Convert</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/prdt'>Predictions</StyledLink>
          <StyledLink href='https://quickswap.exchange/#/analytics'>Analytics</StyledLink>
        </Stack>
        {window && window.ethereum && (window.ethereum.networkVersion === '80001' || window.ethereum.networkVersion === '137') ?
          <Stack direction="row" spacing={3} justifyContent="space-between">
            {account ?
              <div>
                {chainId === 80001 || chainId === 137 ? <Button
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
                </Button> :
                  <div>
                    <Button aria-describedby={id} variant="contained" onClick={handleClick}
                      sx={{
                        background: '#ff5252',
                        borderRadius: '20px',
                        fontFamily: 'Inter',
                        height: '36px'
                      }}
                    // onMouseEnter={handleClick} onMouseLeave={handleClose}
                    >
                      <Text fontFamily="Inter" style={{ color: '#fff' }} fontSize="14px" fontWeight="600">Wrong Network</Text>
                    </Button>
                    <MuiPopover
                      id={id}
                      sx={{
                        '& .MuiPaper-root': {
                          background: 'transparent'
                        },
                      }}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <div style={{
                        background: '#12131a',
                        borderRadius: '10px',
                        padding: '24px'
                      }}>
                        <Text fontFamily="Inter" style={{ color: '#b6b9cc' }} fontSize="16px" fontWeight="800">Please switch your wallet to Polygon Network.</Text>
                        <SwitchButton onClick={swtichToPolygon}>Switch To Polygon</SwitchButton>
                      </div>
                    </MuiPopover>
                  </div>
                }
              </div>
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
          :
          <div>
            <Button aria-describedby={id} variant="contained" onClick={handleClick}
              sx={{
                background: '#ff5252',
                borderRadius: '20px',
                fontFamily: 'Inter',
                height: '36px'
              }}
            // onMouseEnter={handleClick} onMouseLeave={handleClose}
            >
              <Text fontFamily="Inter" style={{ color: '#fff' }} fontSize="14px" fontWeight="600">Wrong Network</Text>
            </Button>
            <MuiPopover
              id={id}
              sx={{
                '& .MuiPaper-root': {
                  background: 'transparent'
                },
              }}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <div style={{
                background: '#12131a',
                borderRadius: '10px',
                padding: '24px'
              }}>
                <Text fontFamily="Inter" style={{ color: '#b6b9cc' }} fontSize="16px" fontWeight="800">Please switch your wallet to Polygon Network.</Text>
                <SwitchButton onClick={swtichToPolygon}>Switch To Polygon</SwitchButton>
              </div>
            </MuiPopover>
          </div>
        }
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

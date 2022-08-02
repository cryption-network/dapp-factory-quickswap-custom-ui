/* eslint-disable import/no-anonymous-default-export */
import { InjectedConnector } from "@web3-react/injected-connector";
// import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
// import { TorusConnector } from "@web3-react/torus-connector";
import { SUPPORTED_NETWORK_IDS } from "../config";
// import getNodeUrl from "./getRpcUrl";

// const POLLING_INTERVAL = 12000;
// const rpcUrl = getNodeUrl();
// const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10);

// eslint-disable-next-line func-names
export default function () {
  const injected = new InjectedConnector({
    supportedChainIds: SUPPORTED_NETWORK_IDS,
  });

  // const walletConnectConnector = new WalletConnectConnector({
  //   rpc: { [SUPPORTED_NETWORK_IDS[0]]: rpcUrl },
  //   bridge: "https://bridge.walletconnect.org",
  //   qrcode: true,
  //   // pollingInterval: POLLING_INTERVAL,
  // });

  // const torusInitParams = {
  //   network: {
  //     host: process.env.REACT_APP_CHAIN_NAME,
  //     chainId: SUPPORTED_NETWORK_IDS[0],
  //   },
  // };

  // const torusGoogleConnector = new TorusConnector({
  //   chainId: SUPPORTED_NETWORK_IDS[0],
  //   initOptions: torusInitParams,
  //   loginOptions: {
  //     verifier: "google",
  //   },
  // });
  // const torusFacebookConnector = new TorusConnector({
  //   chainId: SUPPORTED_NETWORK_IDS[0],
  //   initOptions: torusInitParams,
  //   loginOptions: {
  //     verifier: "facebook",
  //   },
  // });
  // const torusDiscordConnector = new TorusConnector({
  //   chainId: SUPPORTED_NETWORK_IDS[0],
  //   initOptions: torusInitParams,
  //   loginOptions: {
  //     verifier: "discord",
  //   },
  // });

  // const torusTwitterConnector = new TorusConnector({
  //   chainId: SUPPORTED_NETWORK_IDS[0],
  //   initOptions: torusInitParams,
  //   loginOptions: {
  //     verifier: "torus-auth0-twitter",
  //   },
  // });

  // const torusRedditConnector = new TorusConnector({
  //   chainId: SUPPORTED_NETWORK_IDS[0],
  //   initOptions: torusInitParams,
  //   loginOptions: {
  //     verifier: "reddit",
  //   },
  // });

  // const torusEmailConnector = new TorusConnector({
  //   chainId: SUPPORTED_NETWORK_IDS[0],
  //   initOptions: {
  //     ...torusInitParams,
  //     ...{
  //       whiteLabel: {
  //         theme: {
  //           isDark: true,
  //           colors: {
  //             torusBrand1: "#2082e9",
  //           },
  //         },
  //       },
  //       enabledVerifiers: {
  //         google: false,
  //         facebook: false,
  //         discord: false,
  //         twitch: false,
  //         reddit: false,
  //         "torus-auth0-twitter": false,
  //       },
  //     },
  //   },
  // });

  return {
    injected,
    // walletConnectConnector,
    // torusDiscordConnector,
    // torusEmailConnector,
    // torusFacebookConnector,
    // torusGoogleConnector,
    // torusRedditConnector,
    // torusTwitterConnector,
  };
}

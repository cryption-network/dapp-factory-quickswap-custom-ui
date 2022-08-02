// @ts-nocheck
// import { ChainId } from "@cryption-network/polydex-sdk";
import random from "lodash/random";

declare global {
  interface Window {
    web3: any;
    ethereum: any;
  }
}
// Array of available nodes to connect to
export const nodes = {
  "80001": [process.env.REACT_APP_TESTNET_NETWORK_URL],
  "5": [process.env.REACT_APP_TESTNET_NETWORK_URL],
  "137": [process.env.REACT_APP_MAINNET_NETWORK_URL],
  "1": [process.env.REACT_APP_ETH_PROVIDER_LINK],
  "56": [process.env.REACT_APP_BSC_MAINNET_RPC],
  "1287": [process.env.REACT_APP_MOONBEAM_TESTNET_NETWORK_URL],
};

const getNodeUrl = () => {
  let chainId = "80001";
  if (localStorage && localStorage.getItem("chainId")) {
    chainId = localStorage.getItem("chainId");
  }
  if (window && window.ethereum) {
    chainId = window.ethereum.networkVersion;
  }
  if (nodes[chainId] === null || nodes[chainId] === undefined) {
    chainId = process.env.REACT_APP_CHAIN_ID;
  }
  const nodesData = nodes[chainId];
  const randomIndex = random(0, nodesData.length - 1);
  return nodesData[randomIndex];
};

export default getNodeUrl;

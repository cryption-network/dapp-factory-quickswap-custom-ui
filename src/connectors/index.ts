// import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";

import { ArkaneConnector } from "./Arkane";
import { WalletLinkConnector } from "./WalletLink";
import { PortisConnector } from "./Portis";
import { FortmaticConnector } from "./Fortmatic";

const POLLING_INTERVAL = 12000;
const NETWORK_URL = "https://polygon-rpc.com/";

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? "1"
);

if (typeof NETWORK_URL === "undefined") {
  throw new Error(
    `REACT_APP_NETWORK_URL must be a defined environment variable`
  );
}

// export const network = new NetworkConnector({
//   urls: { [Number("137")]: NETWORK_URL },
// });

export const injected = new InjectedConnector({
  supportedChainIds: [137, 80001],
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 137: NETWORK_URL },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

// mainnet only
export const arkaneconnect = new ArkaneConnector({
  clientID: "QuickSwap",
  chainId: 137,
});

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? "",
  chainId: 137,
});

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? "",
  networks: [137],
  config: {
    nodeUrl: NETWORK_URL,
    chainId: 137,
  },
});

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: "Uniswap",
  appLogoUrl:
    "https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg",
  supportedChainIds: [137],
});

export const ledger = new LedgerConnector({
  chainId: 137,
  url: NETWORK_URL,
  pollingInterval: POLLING_INTERVAL,
});

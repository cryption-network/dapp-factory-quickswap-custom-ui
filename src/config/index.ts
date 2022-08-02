import BigNumber from "bignumber.js/bignumber";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});
export const setMetamaskGasPrice = {
  maxPriorityFeePerGas: null,
  maxFeePerGas: null,
};
export const CAKE_PER_BLOCK = new BigNumber(0.75);
export const BLOCKS_PER_YEAR = new BigNumber(15768000);
export const SECONDS_PER_YEAR = new BigNumber(31536000);
export const BSC_BLOCK_TIME = 2.1;
export const CAKE_POOL_PID = 0;
export const BASE_URL = "https://pancakeswap.finance";
export const BASE_EXCHANGE_URL = "https://exchange.pancakeswap.finance";
export const BASE_ADD_LIQUIDITY_URL = `${BASE_EXCHANGE_URL}/#/add`;
export const BASE_LIQUIDITY_POOL_URL = `${BASE_EXCHANGE_URL}/#/pool`;
export const LOTTERY_MAX_NUMBER_OF_TICKETS = 50;
export const LOTTERY_TICKET_PRICE = 1;
export const ETHERJS_PATHS = [
  "/swap",
  "/find",
  "/pool",
  "/add",
  "/migrate",
  "/migrate/find",
];
export const CNTinUSDLink =
  "https://api.coingecko.com/api/v3/simple/price?ids=cryption-network&vs_currencies=USD";
export const CNT_CIRCULATING_SUPPLY_LINK =
  "https://api.cryption.network/circulating-supply";
export const CNT_TOTAL_SUPPLY_LINK =
  "https://api.cryption.network/total-supply";
export const SUPPORTED_NETWORK_IDS = [137, 80001, 1, 5, 56, 1287];
export const CROSS_CHAIN_API_LINK =
  "https://ccf-backend.polydex.org/transcation";
export const IPFS_DEFAULT_IMAGES = {
  CNT: "https://ipfs.infura.io/ipfs/QmceihNozdFNThRJiP2X93X2LXmSb5XWzsTaNsVBA7GwTZ",
  USDC: "https://ipfs.infura.io/ipfs/QmV17MDKrb3aCQa2a2SzBZaCeAeAFrpFmqCjn351cWApGS",
  USDT: "https://ipfs.infura.io/ipfs/QmTXHnF2hcQyqo7DGGRDHMizUMCNRo1CNBJYwbXUKpQWj2",
  DAI: "https://ipfs.infura.io/ipfs/QmVChZZtAijsiTnMRFb6ziQLnRocXnBU2Lb3F67K2ZPHho",
  MATIC:
    "https://ipfs.infura.io/ipfs/QmQnnPC9FKVdC2qnvHdDE45cz6q8grpeBLwBWNETVwzi5Q",
  WMATIC:
    "https://ipfs.infura.io/ipfs/QmQnnPC9FKVdC2qnvHdDE45cz6q8grpeBLwBWNETVwzi5Q",
};
export const NATIVE_TOKENS = {
  80001: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: "18",
  },
  137: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: "18",
  },
  1: {
    name: "ETH",
    symbol: "ETH",
    decimals: "18",
  },
  1287: {
    name: "Glimmer",
    symbol: "GLMR",
    decimals: "18",
  },
};

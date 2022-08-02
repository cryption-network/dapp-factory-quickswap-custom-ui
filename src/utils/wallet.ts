// Set of helper functions to facilitate wallet setup
// @ts-nocheck

import { nodes } from "./getRpcUrl";
import { NATIVE_TOKENS } from "../config";

/**
 * Prompt the user to add BSC as a network on Metamask, or switch to BSC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const setupNetwork = async (chainId: number | string | undefined | null) => {
  const provider = (window as WindowChain).ethereum;
  if (provider) {
    // @ts-ignore
    let chainIdFallback = parseInt(chainId, 10);
    if (chainIdFallback === null || chainIdFallback === undefined) {
      // @ts-ignore
      chainIdFallback = parseInt(process.env.REACT_APP_CHAIN_ID, 10);
    }
    try {
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
    } catch (error) {
      console.error(error);
      return false;
    }
  } else {
    console.error(
      "Can't setup the BSC network on metamask because window.ethereum is undefined"
    );
    return false;
  }
};

/**
 * Prompt the user to add a custom token to metamask
 * @param tokenAddress
 * @param tokenSymbol
 * @param tokenDecimals
 * @param tokenImage
 * @returns {boolean} true if the token has been added, false otherwise
 */
export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage: string
) => {
  // @ts-ignore
  const tokenAdded = await (window as WindowChain).ethereum.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: tokenAddress,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        image: tokenImage,
      },
    },
  });

  return tokenAdded;
};

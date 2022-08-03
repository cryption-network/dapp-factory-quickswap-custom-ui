// @ts-nocheck
import addresses from "../config/constants/contracts";
import { Address } from "../config/constants/types";

export const getAddress = (address: Address, chainId: number): string => {
  return address[chainId || process.env.REACT_APP_CHAIN_ID || 137];
};
export const getQuickswapSingleRewardFactory = (chainId: number) => {
  return getAddress(addresses.quickswapSingleRewardFactory, chainId);
};
// @ts-nocheck
import addresses from "../config/constants/contracts";
import { Address } from "../config/constants/types";

export const getAddress = (address: Address, chainId: number): string => {
  return address[chainId || process.env.REACT_APP_CHAIN_ID || 137];
};
export const getQuickswapSingleRewardFactory = (chainId: number) => {
  return getAddress(addresses.quickswapSingleRewardFactory, chainId);
};
export const getRouterAddress = (chainId: number) => {
  return getAddress(addresses.router, chainId);
};
export const getFactoryAddress = (chainId: number) => {
  return getAddress(addresses.quickswapfactoryAddress, chainId);
};
export const getFarmFactoryAddress = (chainId: number) => {
  return getAddress(addresses.farmFactory, chainId);
};
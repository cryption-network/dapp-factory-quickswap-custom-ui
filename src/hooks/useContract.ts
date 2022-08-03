import { useMemo } from "react";
import useWeb3 from "./useWeb3";
import {
  getERC20Contract,
  getQuickswapSingleRewardContract,
} from "../utils/contractHelpers";
import useActiveWeb3React from "../hooks";

export const useERC20 = (address: string) => {
  const web3 = useWeb3();
  return useMemo(() => getERC20Contract(address, web3), [address, web3]);
};

export const useQuikcswapSingleRewardContract = () => {
  const { chainId } = useActiveWeb3React();
  const web3 = useWeb3();
  return useMemo(
    () => getQuickswapSingleRewardContract(web3, chainId || 137),
    [chainId, web3]
  );
};

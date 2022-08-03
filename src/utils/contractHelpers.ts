import Web3 from "web3";
import { AbiItem } from "web3-utils";
import {
  getQuickswapSingleRewardFactory,
} from "./addressHelpers";
import { Contract } from "web3-eth-contract";
import erc20Abi from "../config/constants/abi/erc20.json";
import quickswapsinglerewardAbi from "../config/constants/abi/quickswapfarmfactoryAbi.json";

export const getContract: (abi: any, address: string, web3: Web3) => Contract =
  (abi: any, address: string, web3: Web3) => {
    return new web3.eth.Contract(abi as unknown as AbiItem, address);
  };

export const getERC20Contract = (address: string, web3: Web3) => {
  return getContract(erc20Abi, address, web3);
};
export const getQuickswapSingleRewardContract = (
  web3: Web3,
  chainId: number
) => {
  return getContract(
    quickswapsinglerewardAbi,
    getQuickswapSingleRewardFactory(chainId),
    web3
  );
};

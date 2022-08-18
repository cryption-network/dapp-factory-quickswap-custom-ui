import { getAddress } from "@ethersproject/address";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { SUPPORTED_WALLETS } from "../config";
import { injected } from "../connectors";

export function getWalletKeys(
  connector: AbstractConnector | undefined
): string[] {
  const { ethereum } = window as any;
  const isMetaMask = !!(ethereum && !ethereum.isBitKeep && ethereum.isMetaMask);
  const isBitkeep = !!(ethereum && ethereum.isBitKeep);
  const isBlockWallet = !!(ethereum && ethereum.isBlockWallet);
  const isCypherDWallet = !!(ethereum && ethereum.isCypherD);
  return Object.keys(SUPPORTED_WALLETS).filter(
    (k) =>
      SUPPORTED_WALLETS[k].connector === connector &&
      (connector !== injected ||
        (isCypherDWallet && k === "CYPHERD") ||
        (isBlockWallet && k === "BLOCKWALLET") ||
        (isBitkeep && k === "BITKEEP") ||
        (isMetaMask && k === "METAMASK"))
  );
}
export function isAddress(value: string | null | undefined): string | false {
  try {
    return getAddress(value || "");
  } catch {
    return false;
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

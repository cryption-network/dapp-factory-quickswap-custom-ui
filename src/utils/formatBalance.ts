import BigNumber from "bignumber.js";

export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
  const displayBalance = new BigNumber(balance).dividedBy(
    new BigNumber(10).pow(decimals)
  );
  return displayBalance.toNumber();
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};

export const getFullDisplayBalanceWithDecimals = (
  balance: BigNumber,
  decimals: BigNumber.Value
) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};

export const getFullDisplayBalanceForStaker = (
  balance: BigNumber,
  decimals = 18
) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed(2);
};

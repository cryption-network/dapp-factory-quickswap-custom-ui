import CoinGecko from "coingecko-api";
import BigNumber from "bignumber.js";

const getCoinGeckoPrice = async (
  symbol: string,
  name: string,
  coingeckIds: any[]
): Promise<number> => {
  const CoinGeckoClient = new CoinGecko();
  let coingecoDetail = coingeckIds.find(
    (eachConfig: { symbol: string; name: string }) =>
      eachConfig.symbol === symbol
  );
  if (name === "Cryption Network Token") {
    const nameTocheck = "Cryption Network";
    coingecoDetail = coingeckIds.find(
      (eachConfig: { symbol: string; name: string }) =>
        eachConfig.symbol === symbol && eachConfig.name === nameTocheck
    );
  }
  let res = new BigNumber(1);
  if (coingecoDetail) {
    const result = await CoinGeckoClient.coins.fetch(
      coingecoDetail.id.toLocaleLowerCase(),
      {}
    );
    res = new BigNumber(result.data?.market_data?.current_price?.usd);
  }
  return res.toNumber();
};

export default getCoinGeckoPrice;

const getCoinGeckoIds = async () => {
  const resp = await fetch("https://api.coingecko.com/api/v3/coins/list");
  return await resp.json();
};

export default getCoinGeckoIds;

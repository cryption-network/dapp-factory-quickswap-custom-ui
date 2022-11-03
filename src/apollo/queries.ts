import { gql } from "@apollo/client";

export const getTokenPrice = gql`
  query getTokenPrice($first: Int!, $skip: Int!, $id: String!) {
    tokens(
      first: $first
      skip: $skip
      where: { id: $id }
      orderDirection: desc
    ) {
      id
      symbol
      name
      derivedETH
      decimals
      tradeVolume
      tradeVolumeUSD
    }
  }
`;
export const ETH_PRICE = gql`
  query bundles {
    bundles(where: { id: "1" }) {
      id
      ethPrice
    }
  }
`;

import { gql } from "@apollo/client";

export const getTokenPrice = gql`
  query getTokenPrice(
    $first: Int!
    $skip: Int!
    $symbol: String!
    $name: String!
  ) {
    tokens(
      first: $first
      skip: $skip
      where: { symbol: $symbol, name: $name }
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolume
      tradeVolumeUSD
    }
  }
`;

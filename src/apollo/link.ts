// @ts-nocheck

import { HttpLink, from, split } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";

const subgraphlinks = {
  quickswaptokenprice:
    "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06",
};
export const funlink = () => {
  const quickswaptokenprice = from([
    new RetryLink(),
    new HttpLink({
      uri: subgraphlinks.quickswaptokenprice,
      // shouldBatch: true,
    }),
  ]);
  const links = split((operation) => {
    return operation.getContext().clientName === "tokenprice";
  }, quickswaptokenprice);
  return links;
};

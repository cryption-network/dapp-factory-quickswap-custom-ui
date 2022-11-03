import React from "react";
import { ModalProvider } from "cryption-uikit-v2";
import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core";
import { ApolloProvider } from "@apollo/client";
// import { Provider } from "react-redux";
import { getLibrary } from "./utils/web3React";
// import store from "./state";
import { createApolloClient } from "../src/apollo";

const Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");
const client = createApolloClient(80001);
const Providers: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ApolloProvider client={client}>
          {/* <Provider store={store}> */}
          <ModalProvider>{children}</ModalProvider>
          {/* </Provider> */}
        </ApolloProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};

export default Providers;

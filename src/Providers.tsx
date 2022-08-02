import React from "react";
import { ModalProvider } from "cryption-uikit-v2";
import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core";
// import { Provider } from "react-redux";
import { getLibrary } from "./utils/web3React";
// import store from "./state";

const Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");

const Providers: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        {/* <Provider store={store}> */}
        <ModalProvider>{children}</ModalProvider>
        {/* </Provider> */}
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};

export default Providers;

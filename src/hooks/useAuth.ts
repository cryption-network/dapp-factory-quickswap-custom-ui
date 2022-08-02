import { useCallback } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { ConnectorNames } from "cryption-uikit-v2";
// import { useToast } from "state/hooks";
import { connectorsByName } from "../utils/web3React";
import { setupNetwork } from "../utils/wallet";

const useAuth = () => {
  const { activate, deactivate } = useWeb3React();
  // const { toastError } = useToast();
  const login = useCallback((connectorID: ConnectorNames) => {
    const connector = connectorsByName[connectorID];
    if (connector) {
      activate(connector, async (error: Error) => {
        if (error instanceof UnsupportedChainIdError) {
          const hasSetup = await setupNetwork(
            process.env.REACT_APP_CHAIN_ID || 137
          );
          if (hasSetup) {
            activate(connector);
          }
        } else {
          console.error(error.name, error.message);
        }
      });
    } else {
      console.error("Can't find connector", "The connector config is wrong");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    login,
    logout: deactivate,
  };
};

export default useAuth;

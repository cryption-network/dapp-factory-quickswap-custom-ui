import React from 'react';
import ReactDOM from 'react-dom';
import { DappFactoryProvider } from "@cryption/dapp-factory-sdk";
import './index.css';
import App from './App';
import Providers from "./Providers";
import useActiveWeb3React from "./hooks";
import reportWebVitals from './reportWebVitals';

declare const window: any;
if ("ethereum" in window) {
  (window && (window.ethereum as any)).autoRefreshOnNetworkChange = false;
}

function DappFactory({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React();
  const chainIdNum = chainId || 137;
  const accountString = account || ""
  return (
    <DappFactoryProvider
      provider={library}
      chainId={chainIdNum}
      account={accountString}
      useDarkMode
    >
      {children}
    </DappFactoryProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Providers>
      <DappFactory>
        <App />
      </DappFactory>
    </Providers>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export * from "./useWeb3";
import detectEthereumProvider from "@metamask/detect-provider";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, { FC, useEffect, useState } from "react";
import Web3 from "web3";
import { AbstractProvider } from "web3-core";
import { JsonRpcPayload, JsonRpcResponse } from "web3-core-helpers";
import { IWeb3Data, Web3Context } from "./useWeb3";

// METAMASK PROVIDER TYPE WORKAROUND (NO REQUEST TYPE) https://github.com/MetaMask/detect-provider/issues/68
interface MetaMaskEthereumProvider {
  isMetaMask?: boolean;
  once(eventName: string | symbol, listener: (...args: any[]) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this;
  addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
}
type RequestArguments = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};
interface MetaMaskProvider extends MetaMaskEthereumProvider {
  request<T>(args: RequestArguments): Promise<T>;
}

enum ESupportedChainIds {
  bscTestNet = 97,
  bscMainnet = 56,
  eth = 1,
  rinkeby = 4,
  matic = 137,
}

class WalletConnectWeb3Provider extends WalletConnectProvider implements AbstractProvider {
  sendAsync(
    payload: JsonRpcPayload,
    callback?: (error: Error | null, result?: JsonRpcResponse) => Promise<unknown> | void
  ): void {}
}

interface Props {
  children: React.ReactNode;
}

export const Web3ContextProvider: FC<Props> = ({ children }) => {
  const [web3Data, setWeb3Data] = useState<IWeb3Data>({ accounts: [], chainId: 1, web3: new Web3() });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    detectEthereumProvider().then(async (provider: any) => {
      if (provider) {
        const web3 = new Web3(provider);
        const chainId = await web3.eth.getChainId();
        const accounts = await web3.eth.getAccounts();
        setWeb3Data({ web3, accounts, chainId });
      }
    });
    setLoading(false);
  }, [web3Data.chainId]);

  const loginWithInjectedWeb3 = async (): Promise<boolean> => {
    setLoading(true);
    const injectedProvider = (await detectEthereumProvider()) as any;
    if (injectedProvider) {
      await injectedProvider.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(injectedProvider);
      const chainId = await web3.eth.getChainId();
      const accounts = await web3.eth.getAccounts();
      setWeb3Data({ web3, accounts, chainId });
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };
  const loginWithWalletConnect = async (chainId: number): Promise<boolean> => {
    let rpc: { [key: number]: string } = {};
    switch (chainId) {
      case ESupportedChainIds.bscTestNet:
        rpc[chainId] = "https://data-seed-prebsc-1-s1.binance.org:8545/";
        break;
      case ESupportedChainIds.bscMainnet:
        rpc[chainId] = "https://bsc-dataseed1.binance.org";
        break;
      case ESupportedChainIds.rinkeby:
        rpc[chainId] = ""; //TBD
        break;
      case ESupportedChainIds.eth:
        rpc[chainId] = ""; //TBD;
        break;
      case ESupportedChainIds.matic:
        rpc[chainId] = "https://rpc-mumbai.maticvigil.com/";
        break;
      default:
        rpc[chainId] = "https://bsc-dataseed1.binance.org";
    }
    setLoading(true);
    try {
      const provider = await new WalletConnectProvider({
        rpc,
        chainId,
        qrcode: true,
        qrcodeModalOptions: {
          mobileLinks: ["metamask", "trust"],
        },
      });
      await provider.enable();
      const web3 = new Web3(provider as WalletConnectWeb3Provider);
      const accounts = await web3.eth.getAccounts();
      setWeb3Data({ web3, accounts, chainId });
      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };
  const logout = async (): Promise<boolean> => {
    web3Data.web3.eth.accounts.wallet.clear();
    setWeb3Data((old) => ({ ...old, accounts: [], web3: new Web3() }));
    return true;
  };
  const switchNetwork = async (chainId: number) => {
    // WalletConnect NOT SUPPORT SWITCH CHAIN
    const provider = (await detectEthereumProvider()) as MetaMaskProvider;
    setLoading(true);
    try {
      if (provider) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + Number(chainId).toString(16) }],
        });
      }
      setWeb3Data((old) => ({ ...old, chainId }));
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <Web3Context.Provider
      value={{ web3Data, loginWithInjectedWeb3, loginWithWalletConnect, logout, switchNetwork, loading }}
    >
      {children}
    </Web3Context.Provider>
  );
};

"use client";

import { BrowserProvider } from "ethers";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOT_TESTNET } from "@/lib/chain";
import { friendlyError } from "@/lib/errors";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
};
declare global { interface Window { ethereum?: EthereumProvider } }

type WalletState = { account: string; chainId: number | null; connecting: boolean; error: string; connect: () => Promise<string>; disconnect: () => void; browserProvider: () => BrowserProvider | null };
const WalletContext = createContext<WalletState | null>(null);

async function ensureBotTestnet(ethereum: EthereumProvider) {
  try { await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BOT_TESTNET.chainIdHex }] }); }
  catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: BOT_TESTNET.chainIdHex, chainName: BOT_TESTNET.name, nativeCurrency: BOT_TESTNET.currency, rpcUrls: [BOT_TESTNET.rpcUrl], blockExplorerUrls: [BOT_TESTNET.explorerUrl] }] });
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;
    const load = async () => {
      if (window.localStorage.getItem("payroster_disconnected") === "true") return;
      const [accounts, chain] = await Promise.all([ethereum.request({ method: "eth_accounts" }), ethereum.request({ method: "eth_chainId" })]);
      setAccount(((accounts as string[])?.[0] || "")); setChainId(Number(chain));
    };
    const accountsChanged = (...args: unknown[]) => {
      if (window.localStorage.getItem("payroster_disconnected") === "true") return;
      setAccount((((args[0] as string[]) || [])[0] || ""));
    };
    const chainChanged = (...args: unknown[]) => setChainId(Number(args[0]));
    load().catch(() => undefined);
    ethereum.on?.("accountsChanged", accountsChanged); ethereum.on?.("chainChanged", chainChanged);
    return () => { ethereum.removeListener?.("accountsChanged", accountsChanged); ethereum.removeListener?.("chainChanged", chainChanged); };
  }, []);

  const connect = useCallback(async () => {
    setError("");
    if (!window.ethereum) { setError("A compatible wallet is required. Install MetaMask, Bitget Wallet, or TokenPocket to continue."); return ""; }
    setConnecting(true);
    try {
      await ensureBotTestnet(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      const nextAccount = accounts[0] || "";
      window.localStorage.removeItem("payroster_disconnected");
      setAccount(nextAccount); setChainId(BOT_TESTNET.chainId); return nextAccount;
    } catch (caught) { setError(friendlyError(caught)); return ""; }
    finally { setConnecting(false); }
  }, []);

  const disconnect = useCallback(() => {
    window.localStorage.setItem("payroster_disconnected", "true");
    setAccount(""); setChainId(null); setError("");
  }, []);
  const value = useMemo<WalletState>(() => ({ account, chainId, connecting, error, connect, disconnect, browserProvider: () => window.ethereum ? new BrowserProvider(window.ethereum) : null }), [account, chainId, connecting, error, connect, disconnect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() { const value = useContext(WalletContext); if (!value) throw new Error("WalletProvider is missing"); return value; }
export function shortAddress(address: string) { return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ""; }

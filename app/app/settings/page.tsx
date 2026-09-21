"use client";

import { Copy, ExternalLink, Network, ShieldCheck, WalletCards } from "lucide-react";
import { useState } from "react";
import { BOT_TESTNET, CONTRACT_ADDRESS, explorerAddress } from "@/lib/chain";
import { usePayrollData } from "@/components/payroll-data-provider";
import { InlineError, LoadingState, PageHeader } from "@/components/ui";
import { shortAddress, useWallet } from "@/components/wallet-provider";

export default function SettingsPage() {
  const data = usePayrollData(); const { account } = useWallet(); const [copied, setCopied] = useState(""); if (data.loading) return <div className="app-content"><LoadingState /></div>;
  function copy(value: string, label: string) { navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1600); }
  return <div className="app-content"><PageHeader eyebrow="Settings" title="Contract and network" description="Addresses and network details used by this workspace." />{data.error ? <InlineError message={data.error} /> : null}<div className="settings-list">
    <section className="panel setting-card"><span><ShieldCheck /></span><div><h2>Payroll contract</h2><p>{shortAddress(CONTRACT_ADDRESS)}</p><small>{account.toLowerCase() === data.owner.toLowerCase() ? "Your connected wallet owns this contract." : "Your connected wallet can view this contract but is not its owner."}</small></div><button className="icon-action" onClick={() => copy(CONTRACT_ADDRESS, "contract")} aria-label="Copy contract address"><Copy /></button><a className="icon-action" href={explorerAddress(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer" aria-label="Open contract on explorer"><ExternalLink /></a></section>
    <section className="panel setting-card"><span><WalletCards /></span><div><h2>Contract owner</h2><p>{shortAddress(data.owner)}</p><small>Only this wallet can configure or run payroll.</small></div><button className="icon-action" onClick={() => copy(data.owner, "owner")} aria-label="Copy owner address"><Copy /></button></section>
    <section className="panel setting-card"><span><Network /></span><div><h2>{BOT_TESTNET.name}</h2><p>Chain ID {BOT_TESTNET.chainId} · BOT</p><small>Latest block #{data.blockNumber.toLocaleString()}</small></div><a className="button button-secondary" href={BOT_TESTNET.explorerUrl} target="_blank" rel="noreferrer">Explorer <ExternalLink /></a></section>
  </div>{copied ? <div className="toast">{copied === "owner" ? "Owner address" : "Contract address"} copied</div> : null}</div>;
}

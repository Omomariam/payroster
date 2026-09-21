"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, History, LayoutDashboard, LogOut, Menu, Settings, Users, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { BOT_TESTNET } from "@/lib/chain";
import { Brand } from "./brand";
import { PayrollDataProvider } from "./payroll-data-provider";
import { shortAddress, useWallet } from "./wallet-provider";

const navigation = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/payroll", label: "Payroll", icon: WalletCards },
  { href: "/app/history", label: "History", icon: History },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { account, chainId, connect, connecting, error, disconnect } = useWallet();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!account) return <div className="wallet-gate"><Link href="/"><Brand dark /></Link><div><span className="gate-icon"><WalletCards /></span><h1>Connect your wallet to continue</h1><p>PayRoster reads your payroll contract and sends transactions through your wallet. Your keys never leave it.</p><button className="button button-primary button-large" onClick={connect} disabled={connecting}>{connecting ? "Check your wallet" : "Connect wallet"}</button>{error ? <p className="form-error" role="alert">{error}</p> : null}<Link href="/">Return to website</Link></div></div>;

  return <PayrollDataProvider><div className="dashboard-shell">
    <aside className={menu ? "open" : ""}>
      <div className="side-brand"><Brand /><button onClick={() => setMenu(false)} aria-label="Close navigation"><X /></button></div>
      <div className="workspace"><span>PR</span><div><b>Payroll workspace</b><small>BOT Chain Testnet</small></div></div>
      <nav>{navigation.map((item) => { const active = pathname === item.href; return <Link className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setMenu(false)}><item.icon />{item.label}</Link>; })}</nav>
      <div className="side-foot"><a href="https://scan.bohr.life" target="_blank" rel="noreferrer"><span className="chain-dot" />BOT Testnet<ExternalLink /></a><button onClick={() => { disconnect(); router.push("/"); }}><LogOut />Disconnect</button></div>
    </aside>
    {menu ? <button className="nav-scrim" onClick={() => setMenu(false)} aria-label="Close navigation" /> : null}
    <section className="dashboard-main">
      <header><button className="mobile-menu" onClick={() => setMenu(true)} aria-label="Open navigation"><Menu /></button><span className={`live-network ${chainId === BOT_TESTNET.chainId ? "online" : "wrong"}`}><i />{chainId === BOT_TESTNET.chainId ? "BOT Chain Testnet" : "Wrong network"}</span><span className="connected-wallet"><i />{shortAddress(account)}</span></header>
      {children}
    </section>
  </div></PayrollDataProvider>;
}

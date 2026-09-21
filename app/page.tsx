"use client";

import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Menu, ShieldCheck, WalletCards, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { useWallet } from "@/components/wallet-provider";
import { CONTRACT_ADDRESS, explorerAddress } from "@/lib/chain";

export default function LandingPage() {
  const { account, connect, connecting, error } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function enterApp() {
    const connected = account || await connect();
    if (connected) router.push("/app");
  }

  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link href="/" aria-label="PayRoster home"><Brand dark /></Link>
        <div className={`landing-links ${menuOpen ? "open" : ""}`}>
          <a href="#product">Product</a><a href="#security">Security</a><a href="#bot-chain">BOT Chain</a>
          <button className="nav-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <div className="landing-actions">
          <button className="button button-ghost" onClick={enterApp}>{account ? "Open app" : "Sign in"}</button>
          <button className="button button-primary" onClick={enterApp} disabled={connecting}>{connecting ? "Connecting…" : account ? "Dashboard" : "Connect wallet"}<ArrowRight size={16} /></button>
          <button className="nav-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Built for teams on BOT Chain</div>
          <h1>Payroll that moves<br />at the speed of work.</h1>
          <p>Configure salaries, fund your treasury, and pay your entire team in a single on-chain transaction.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={enterApp} disabled={connecting}><WalletCards size={18} />{connecting ? "Check your wallet" : "Connect wallet"}</button>
            <a className="text-link" href="#product">See how it works <ArrowRight size={15} /></a>
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="hero-proof"><span><Check /> No subscriptions</span><span><Check /> On-chain records</span><span><Check /> You control the funds</span></div>
        </div>
        <div className="hero-visual" aria-label="PayRoster contract details">
          <div className="preview-window">
            <div className="preview-top"><Brand /><span className="network-tag"><i /> BOT Testnet</span></div>
            <div className="preview-body">
              <span className="preview-label">Live payroll contract</span><strong>Deployed &amp; verified</strong>
              <div className="preview-run"><span>Network<small>Chain ID 968</small></span><b>BOT Chain Testnet</b></div>
              <div className="preview-team"><span className="avatar avatar-one">01</span><span><b>Configure roster</b><small>Wallet, salary, and schedule</small></span><em>On-chain</em></div>
              <div className="preview-team"><span className="avatar avatar-two">02</span><span><b>Approve payroll</b><small>Signed by the contract owner</small></span><em>In wallet</em></div>
              <a className="preview-contract-link" href={explorerAddress(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer">View verified contract <ExternalLink size={14} /></a>
            </div>
          </div>
          <div className="proof-card"><ShieldCheck /><span><b>On-chain by default</b><small>Every payment is independently verifiable.</small></span></div>
        </div>
      </section>

      <section className="product-section" id="product">
        <div className="section-intro"><span>Everything you need</span><h2>A clear path from setup to payday.</h2><p>PayRoster keeps payroll operations focused and auditable without taking control of your wallet.</p></div>
        <div className="feature-grid">
          <article><b>01</b><h3>Configure your roster</h3><p>Add each recipient’s wallet, salary, role, and payment interval directly to the payroll contract.</p></article>
          <article><b>02</b><h3>Fund the treasury</h3><p>Deposit testnet BOT into the contract. The dashboard always reflects the live on-chain balance.</p></article>
          <article><b>03</b><h3>Run payroll once</h3><p>Review due recipients, approve one transaction, and follow every payment on the block explorer.</p></article>
        </div>
      </section>

      <section className="security-section" id="security">
        <div><span className="section-kicker">Built for verification</span><h2>Your wallet stays in charge.</h2></div>
        <div className="security-points"><p><Check /> PayRoster never stores private keys.</p><p><Check /> Every action requires your wallet approval.</p><p><Check /> Contract events form the payment record.</p></div>
      </section>

      <section className="chain-section" id="bot-chain">
        <div className="chain-mark">B</div><div><span>Powered by</span><h2>BOT Chain</h2><p>Fast, EVM-compatible infrastructure for programmable payments.</p></div>
        <div className="chain-links"><a href="https://botchain.ai" target="_blank" rel="noreferrer">botchain.ai <ExternalLink /></a><a href="https://scan.botchain.ai" target="_blank" rel="noreferrer">scan.botchain.ai <ExternalLink /></a></div>
      </section>

      <footer><Brand dark /><p>Pay your team with ease.</p><div><a href="https://botchain.ai" target="_blank" rel="noreferrer">BOT Chain</a><a href="https://scan.botchain.ai" target="_blank" rel="noreferrer">Explorer</a></div></footer>
    </main>
  );
}

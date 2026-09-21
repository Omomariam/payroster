"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CircleDollarSign, ExternalLink, Plus, Users, WalletCards } from "lucide-react";
import { useState } from "react";
import { CONTRACT_ADDRESS, explorerAddress, explorerTransaction } from "@/lib/chain";
import { DepositForm } from "@/components/deposit-form";
import { MemberForm } from "@/components/member-form";
import { bot, usePayrollData } from "@/components/payroll-data-provider";
import { EmptyState, InlineError, LoadingState, PageHeader, formatDateTime } from "@/components/ui";
import { shortAddress } from "@/components/wallet-provider";

export default function OverviewPage() {
  const data = usePayrollData(); const [modal, setModal] = useState<"member" | "deposit" | null>(null);
  const monthly = data.employees.reduce((sum, employee) => sum + employee.salary, 0n);
  const nextDue = data.employees.length ? Math.min(...data.employees.map((employee) => employee.nextPaymentAt)) : 0;
  if (data.loading) return <div className="app-content"><LoadingState /></div>;
  return <div className="app-content"><PageHeader eyebrow="Overview" title="Payroll at a glance" description="Live contract data from BOT Chain Testnet." actions={<><button className="button button-secondary" onClick={() => setModal("member")}><Plus />Add member</button><button className="button button-primary" onClick={() => setModal("deposit")}><WalletCards />Fund contract</button></>} />
    {data.error ? <InlineError message={data.error} /> : null}
    <div className="metric-grid">
      <article><span className="metric-icon blue"><CircleDollarSign /></span><div><small>Contract balance</small><strong>{bot(data.balance)} BOT</strong><p><a href={explorerAddress(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer">View contract <ExternalLink /></a></p></div></article>
      <article><span className="metric-icon green"><Users /></span><div><small>Active team</small><strong>{data.employees.length}</strong><p>Configured on-chain</p></div></article>
      <article><span className="metric-icon violet"><CalendarDays /></span><div><small>Total scheduled</small><strong>{bot(monthly)} BOT</strong><p>{nextDue ? `Next due ${new Date(nextDue * 1000).toLocaleDateString()}` : "No payments scheduled"}</p></div></article>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Team payroll</h2><p>Current active contract configurations</p></div><Link href="/app/team">Manage team <ArrowRight /></Link></div>
      {data.employees.length === 0 ? <EmptyState icon={<Users />} title="No team members yet" text="Add your first team member to create a payroll schedule on-chain." action={<button className="button button-primary" onClick={() => setModal("member")}><Plus />Add first member</button>} /> : <div className="data-table"><div className="table-head"><span>Team member</span><span>Wallet</span><span>Salary</span><span>Next payment</span></div>{data.employees.slice(0, 5).map((employee) => <div className="table-row" key={employee.address}><span className="person"><i>{employee.name.slice(0, 2).toUpperCase()}</i><span><b>{employee.name}</b><small>{employee.role}</small></span></span><span className="mono">{shortAddress(employee.address)}</span><strong>{bot(employee.salary)} BOT</strong><span>{new Date(employee.nextPaymentAt * 1000).toLocaleDateString()}</span></div>)}</div>}
    </section>
    <section className="panel recent-panel"><div className="panel-head"><div><h2>Recent payments</h2><p>Confirmed contract events</p></div><Link href="/app/history">Full history <ArrowRight /></Link></div>{data.payments.length === 0 ? <div className="compact-empty">No payments have been sent from this contract.</div> : data.payments.slice(0, 4).map((payment) => <a className="payment-row" key={`${payment.hash}-${payment.employee}`} href={explorerTransaction(payment.hash)} target="_blank" rel="noreferrer"><span className="payment-status">✓</span><span><b>{shortAddress(payment.employee)}</b><small>{formatDateTime(payment.paidAt)}</small></span><strong>{bot(payment.amount)} BOT</strong><ExternalLink /></a>)}</section>
    {modal === "member" ? <MemberForm onClose={() => setModal(null)} /> : null}{modal === "deposit" ? <DepositForm onClose={() => setModal(null)} /> : null}
  </div>;
}

"use client";

import { ExternalLink, History } from "lucide-react";
import { explorerTransaction } from "@/lib/chain";
import { bot, usePayrollData } from "@/components/payroll-data-provider";
import { EmptyState, InlineError, LoadingState, PageHeader, formatDateTime } from "@/components/ui";
import { shortAddress } from "@/components/wallet-provider";

export default function HistoryPage() {
  const data = usePayrollData(); if (data.loading) return <div className="app-content"><LoadingState /></div>;
  return <div className="app-content"><PageHeader eyebrow="History" title="Confirmed payments" description="An immutable record built from PaymentSent events." />{data.error ? <InlineError message={data.error} /> : null}<section className="panel">{data.payments.length === 0 ? <EmptyState icon={<History />} title="No payment history" text="Confirmed payroll payments will appear here automatically." /> : <div className="history-table"><div className="table-head"><span>Recipient</span><span>Amount</span><span>Date</span><span>Block</span><span /></div>{data.payments.map((payment, index) => <div className="table-row" key={`${payment.hash}-${index}`}><span className="person"><i>✓</i><span><b>{shortAddress(payment.employee)}</b><small>Payment confirmed</small></span></span><strong>{bot(payment.amount, 4)} BOT</strong><span>{formatDateTime(payment.paidAt)}</span><span className="mono">#{payment.blockNumber.toLocaleString()}</span><a className="icon-action" href={explorerTransaction(payment.hash)} target="_blank" rel="noreferrer" aria-label="View transaction"><ExternalLink /></a></div>)}</div>}</section></div>;
}

"use client";

import { CheckCircle2, ExternalLink, LoaderCircle, Send, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { explorerTransaction } from "@/lib/chain";
import { DepositForm } from "@/components/deposit-form";
import { bot, usePayrollData } from "@/components/payroll-data-provider";
import { EmptyState, InlineError, LoadingState, PageHeader, Success, formatDate } from "@/components/ui";

export default function PayrollPage() {
  const data = usePayrollData(); const [deposit, setDeposit] = useState(false); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [hash, setHash] = useState("");
  const now = Math.floor(Date.now() / 1000); const due = useMemo(() => data.employees.filter((employee) => employee.nextPaymentAt <= now), [data.employees, now]); const total = due.reduce((sum, employee) => sum + employee.salary, 0n); const funded = data.balance >= total;
  async function run() { setError(""); setHash(""); setPending(true); try { setHash(await data.runPayroll(due.map((employee) => employee.address))); } catch (caught) { setError((caught as Error).message); } finally { setPending(false); } }
  if (data.loading) return <div className="app-content"><LoadingState /></div>;
  return <div className="app-content"><PageHeader eyebrow="Payroll" title="Review and pay" description="Only payments currently due under the contract are included." actions={<button className="button button-secondary" onClick={() => setDeposit(true)}><WalletCards />Fund contract</button>} />{data.error ? <InlineError message={data.error} /> : null}
    <div className="payroll-layout"><section className="panel"><div className="panel-head"><div><h2>Due now</h2><p>{due.length} {due.length === 1 ? "recipient" : "recipients"}</p></div><span className="live-label"><i />Live</span></div>{due.length === 0 ? <EmptyState icon={<CheckCircle2 />} title="Payroll is up to date" text="There are no scheduled payments due at this time." /> : <div className="pay-list">{due.map((employee) => <div key={employee.address}><span className="person"><i>{employee.name.slice(0, 2).toUpperCase()}</i><span><b>{employee.name}</b><small>Due {formatDate(employee.nextPaymentAt)}</small></span></span><strong>{bot(employee.salary)} BOT</strong></div>)}</div>}</section>
      <aside className="panel summary-card"><h2>Payment summary</h2><dl><div><dt>Recipients</dt><dd>{due.length}</dd></div><div><dt>Payroll total</dt><dd>{bot(total)} BOT</dd></div><div><dt>Contract balance</dt><dd>{bot(data.balance)} BOT</dd></div></dl><div className={`fund-status ${funded ? "funded" : "short"}`}><span>{funded ? "Contract is funded" : "More funds required"}</span>{!funded ? <small>{bot(total - data.balance)} BOT short</small> : null}</div>{error ? <InlineError message={error} /> : null}{hash ? <Success message="Payroll confirmed on BOT Chain." /> : null}{hash ? <a className="transaction-link" href={explorerTransaction(hash)} target="_blank" rel="noreferrer">View transaction <ExternalLink /></a> : null}<button className="button button-primary button-full" disabled={!due.length || !funded || pending} onClick={run}>{pending ? <LoaderCircle className="spin" /> : <Send />}{pending ? "Waiting for confirmation" : "Run payroll"}</button><p className="form-note">Your wallet shows the transaction before anything is submitted.</p></aside>
    </div>{deposit ? <DepositForm onClose={() => setDeposit(false)} /> : null}
  </div>;
}

"use client";

import { ExternalLink, LoaderCircle, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { explorerAddress } from "@/lib/chain";
import { MemberForm } from "@/components/member-form";
import { bot, usePayrollData } from "@/components/payroll-data-provider";
import { EmptyState, InlineError, LoadingState, PageHeader, formatDate } from "@/components/ui";
import { shortAddress } from "@/components/wallet-provider";

export default function TeamPage() {
  const data = usePayrollData(); const [adding, setAdding] = useState(false); const [removing, setRemoving] = useState(""); const [actionError, setActionError] = useState("");
  async function removeMember(address: string, name: string) { if (!window.confirm(`Remove ${name} from future payroll runs? This change will be recorded on-chain.`)) return; setRemoving(address); setActionError(""); try { await data.remove(address); } catch (caught) { setActionError((caught as Error).message); } finally { setRemoving(""); } }
  if (data.loading) return <div className="app-content"><LoadingState /></div>;
  return <div className="app-content"><PageHeader eyebrow="Team" title="Payroll roster" description="Every active member is read directly from the payroll contract." actions={<button className="button button-primary" onClick={() => setAdding(true)}><Plus />Add member</button>} />{data.error ? <InlineError message={data.error} /> : null}{actionError ? <InlineError message={actionError} /> : null}
    <section className="panel">{data.employees.length === 0 ? <EmptyState icon={<Users />} title="Your roster is empty" text="Add a wallet, salary, and payment schedule to get started." action={<button className="button button-primary" onClick={() => setAdding(true)}><Plus />Add member</button>} /> : <div className="data-table team-table"><div className="table-head"><span>Member</span><span>Wallet</span><span>Salary</span><span>Schedule</span><span /></div>{data.employees.map((employee) => <div className="table-row" key={employee.address}><span className="person"><i>{employee.name.slice(0, 2).toUpperCase()}</i><span><b>{employee.name}</b><small>{employee.role}</small></span></span><a className="mono table-link" href={explorerAddress(employee.address)} target="_blank" rel="noreferrer">{shortAddress(employee.address)} <ExternalLink /></a><strong>{bot(employee.salary)} BOT</strong><span><b>{formatDate(employee.nextPaymentAt)}</b><small>Every {Math.round(employee.interval / 86400)} days</small></span><button className="icon-action danger" onClick={() => removeMember(employee.address, employee.name)} disabled={removing === employee.address} aria-label={`Remove ${employee.name}`}>{removing === employee.address ? <LoaderCircle className="spin" /> : <Trash2 />}</button></div>)}</div>}</section>
    {adding ? <MemberForm onClose={() => setAdding(false)} /> : null}
  </div>;
}

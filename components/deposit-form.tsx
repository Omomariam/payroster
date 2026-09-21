"use client";

import { LoaderCircle, WalletCards } from "lucide-react";
import { FormEvent, useState } from "react";
import { usePayrollData } from "./payroll-data-provider";
import { InlineError, Modal, Success } from "./ui";

export function DepositForm({ onClose }: { onClose: () => void }) {
  const { deposit } = usePayrollData(); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setPending(true); const amount = String(new FormData(event.currentTarget).get("amount")); try { const hash = await deposit(amount); setSuccess(`Deposit confirmed. Transaction ${hash.slice(0, 10)}…`); window.setTimeout(onClose, 1400); } catch (caught) { setError((caught as Error).message); } finally { setPending(false); } }
  return <Modal title="Fund payroll contract" description="BOT will move from your connected wallet to the payroll contract." onClose={onClose}><form className="form" onSubmit={submit}><label><span>Deposit amount</span><div className="input-suffix"><input name="amount" required autoFocus type="number" min="0.000001" step="any" placeholder="0.00" /><b>BOT</b></div></label><p className="form-note">Your wallet will show the exact amount and network fee before you approve.</p>{error ? <InlineError message={error} /> : null}{success ? <Success message={success} /> : null}<div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={pending}>{pending ? <LoaderCircle className="spin" /> : <WalletCards />}{pending ? "Waiting for confirmation" : "Review deposit"}</button></div></form></Modal>;
}

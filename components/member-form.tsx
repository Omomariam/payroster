"use client";

import { isAddress } from "ethers";
import { LoaderCircle, Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { usePayrollData } from "./payroll-data-provider";
import { InlineError, Modal, Success } from "./ui";

export function MemberForm({ onClose }: { onClose: () => void }) {
  const { configure } = usePayrollData();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess("");
    const data = new FormData(event.currentTarget);
    const address = String(data.get("address")).trim();
    if (!isAddress(address)) { setError("Enter a valid EVM wallet address beginning with 0x."); return; }
    const date = new Date(String(data.get("date")));
    if (Number.isNaN(date.getTime())) { setError("Choose the first payment date."); return; }
    setPending(true);
    try {
      const hash = await configure({ address, name: String(data.get("name")).trim(), role: String(data.get("role")).trim(), salary: String(data.get("salary")), nextPaymentAt: Math.floor(date.getTime() / 1000), interval: Number(data.get("interval")) });
      setSuccess(`Team member saved on-chain. Transaction ${hash.slice(0, 10)}… confirmed.`);
      window.setTimeout(onClose, 1400);
    } catch (caught) { setError((caught as Error).message); }
    finally { setPending(false); }
  }

  const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return <Modal title="Add team member" description="This creates a payroll configuration on BOT Chain." onClose={onClose}><form className="form" onSubmit={submit}>
    <label><span>Full name</span><input name="name" required autoFocus placeholder="e.g. Maya Okafor" /></label>
    <label><span>Role</span><input name="role" required placeholder="e.g. Product designer" /></label>
    <label><span>Wallet address</span><input name="address" required placeholder="0x…" spellCheck={false} /></label>
    <div className="form-row"><label><span>Salary</span><div className="input-suffix"><input name="salary" required type="number" min="0.000001" step="any" placeholder="0" /><b>BOT</b></div></label><label><span>Frequency</span><select name="interval" defaultValue="2592000"><option value="604800">Weekly</option><option value="1209600">Every 2 weeks</option><option value="2592000">Monthly</option></select></label></div>
    <label><span>First payment date</span><input name="date" required type="date" min={defaultDate} defaultValue={defaultDate} /></label>
    {error ? <InlineError message={error} /> : null}{success ? <Success message={success} /> : null}
    <div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={pending}>{pending ? <LoaderCircle className="spin" /> : <Plus />}{pending ? "Confirm in wallet" : "Add on-chain"}</button></div>
  </form></Modal>;
}

"use client";

import { Contract, EventLog, JsonRpcProvider, formatEther, parseEther } from "ethers";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOT_TESTNET, CONTRACT_ADDRESS, DEPLOYMENT_BLOCK, PAYROSTER_ABI } from "@/lib/chain";
import { friendlyError } from "@/lib/errors";
import { useWallet } from "./wallet-provider";

export type Employee = { address: string; name: string; role: string; salary: bigint; nextPaymentAt: number; interval: number; active: boolean };
export type Payment = { hash: string; employee: string; amount: bigint; paidAt: number; blockNumber: number };
type ConfigureInput = { address: string; name: string; role: string; salary: string; nextPaymentAt: number; interval: number };
type PayrollData = {
  employees: Employee[]; payments: Payment[]; balance: bigint; owner: string; blockNumber: number; loading: boolean; error: string; configured: boolean;
  refresh: () => Promise<void>; configure: (input: ConfigureInput) => Promise<string>; remove: (address: string) => Promise<string>;
  deposit: (amount: string) => Promise<string>; runPayroll: (addresses: string[]) => Promise<string>;
};

const DataContext = createContext<PayrollData | null>(null);
const rpcProvider = new JsonRpcProvider(BOT_TESTNET.rpcUrl, BOT_TESTNET.chainId, { staticNetwork: true });

export function PayrollDataProvider({ children }: { children: React.ReactNode }) {
  const { browserProvider } = useWallet();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState(0n);
  const [owner, setOwner] = useState("");
  const [blockNumber, setBlockNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const configured = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

  const refresh = useCallback(async () => {
    if (!configured) { setError("The payroll contract has not been configured for this deployment."); setLoading(false); return; }
    try {
      const contract = new Contract(CONTRACT_ADDRESS, PAYROSTER_ABI, rpcProvider);
      const currentBlock = await rpcProvider.getBlockNumber();
      const [contractBalance, contractOwner, addresses] = await Promise.all([rpcProvider.getBalance(CONTRACT_ADDRESS), contract.owner() as Promise<string>, contract.getEmployees() as Promise<string[]>]);
      const rows = await Promise.all(addresses.map(async (address) => {
        const config = await contract.payrolls(address);
        return { address, name: config.name, role: config.role, salary: config.salary as bigint, nextPaymentAt: Number(config.nextPaymentAt), interval: Number(config.interval), active: config.active as boolean };
      }));
      const filter = contract.filters.PaymentSent();
      const logs = await contract.queryFilter(filter, DEPLOYMENT_BLOCK || Math.max(0, currentBlock - 100000), currentBlock);
      const paymentRows = logs.filter((log): log is EventLog => log instanceof EventLog).map((log) => ({ hash: log.transactionHash, employee: String(log.args.employee), amount: log.args.amount as bigint, paidAt: Number(log.args.paidAt), blockNumber: log.blockNumber })).reverse();
      setBalance(contractBalance); setOwner(contractOwner); setEmployees(rows.filter((row) => row.active)); setPayments(paymentRows); setBlockNumber(currentBlock); setError("");
    } catch (caught) { setError(friendlyError(caught)); }
    finally { setLoading(false); }
  }, [configured]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 12000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const write = useCallback(async (method: string, args: unknown[], value?: bigint) => {
    const provider = browserProvider();
    if (!provider) throw new Error("wallet unavailable");
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROSTER_ABI, signer);
      const transaction = await contract[method](...args, value === undefined ? {} : { value });
      await transaction.wait();
      await refresh();
      return transaction.hash as string;
    } catch (caught) { throw new Error(friendlyError(caught)); }
  }, [browserProvider, refresh]);

  const configure = useCallback((input: ConfigureInput) => write("configurePayroll", [input.address, input.name, input.role, parseEther(input.salary), input.nextPaymentAt, input.interval]), [write]);
  const remove = useCallback((address: string) => write("removePayroll", [address]), [write]);
  const runPayroll = useCallback((addresses: string[]) => write("runPayroll", [addresses]), [write]);
  const deposit = useCallback(async (amount: string) => {
    const provider = browserProvider();
    if (!provider) throw new Error("Connect your wallet to deposit funds.");
    try { const signer = await provider.getSigner(); const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: parseEther(amount) }); await tx.wait(); await refresh(); return tx.hash; }
    catch (caught) { throw new Error(friendlyError(caught)); }
  }, [browserProvider, refresh]);

  const value = useMemo(() => ({ employees, payments, balance, owner, blockNumber, loading, error, configured, refresh, configure, remove, deposit, runPayroll }), [employees, payments, balance, owner, blockNumber, loading, error, configured, refresh, configure, remove, deposit, runPayroll]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function usePayrollData() { const value = useContext(DataContext); if (!value) throw new Error("PayrollDataProvider is missing"); return value; }
export function bot(value: bigint, precision = 2) { return Number(formatEther(value)).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }); }

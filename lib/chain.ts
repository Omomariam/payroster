export const BOT_TESTNET = {
  chainId: 968,
  chainIdHex: "0x3C8",
  name: "BOT Chain Testnet",
  rpcUrl: "https://rpc.bohr.life",
  explorerUrl: "https://scan.bohr.life",
  currency: { name: "BOT", symbol: "BOT", decimals: 18 },
} as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYROSTER_CONTRACT_ADDRESS || "";
export const DEPLOYMENT_BLOCK = Number(process.env.NEXT_PUBLIC_PAYROSTER_DEPLOYMENT_BLOCK || 0);

export const PAYROSTER_ABI = [
  "function owner() view returns (address)",
  "function getEmployees() view returns (address[])",
  "function payrolls(address) view returns (string name, string role, uint256 salary, uint64 nextPaymentAt, uint32 interval, bool active)",
  "function configurePayroll(address employee, string name, string role, uint256 salary, uint64 nextPaymentAt, uint32 interval)",
  "function removePayroll(address employee)",
  "function runPayroll(address[] employees) returns (bytes32)",
  "function batchPay(address[] recipients, uint256[] amounts) payable returns (bytes32)",
  "event PayrollConfigured(address indexed employee, string name, string role, uint256 salary, uint64 nextPaymentAt, uint32 interval)",
  "event PayrollRemoved(address indexed employee)",
  "event PaymentSent(address indexed employee, uint256 amount, uint256 paidAt)",
  "event BatchPaymentCompleted(bytes32 indexed batchId, uint256 recipientCount, uint256 totalAmount)",
  "event FundsDeposited(address indexed sender, uint256 amount)",
] as const;

export function explorerAddress(address: string) { return `${BOT_TESTNET.explorerUrl}/address/${address}`; }
export function explorerTransaction(hash: string) { return `${BOT_TESTNET.explorerUrl}/tx/${hash}`; }

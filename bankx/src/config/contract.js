import deployments from "./deployments.json";

export function getDeployment(chainId) {
  return deployments[String(chainId)] || null;
}

export function getLegacyBankXAddress(chainId) {
  return getDeployment(chainId)?.legacyBankX
    || import.meta.env.VITE_LEGACY_BANKX_ADDRESS
    || import.meta.env.VITE_BANKX_ADDRESS
    || "";
}

export const BANKX_CONTRACT_ADDRESS =
  import.meta.env.VITE_LEGACY_BANKX_ADDRESS
  || import.meta.env.VITE_BANKX_ADDRESS
  || "";

export const BANKX_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function requestLoan(uint256 amount)",
  "function repayLoan() payable",

  "function getSavings() view returns (uint256)",
  "function getLoan() view returns (uint256)",
  "function getPoolBalance() view returns (uint256)",

  "function totalPool() view returns (uint256)",
  "function savings(address) view returns (uint256)",
  "function loans(address) view returns (uint256)",
  "function owner() view returns (address)",

  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event LoanRequested(address indexed borrower, uint256 amount)",
  "event LoanRepaid(address indexed borrower, uint256 amount)",
];
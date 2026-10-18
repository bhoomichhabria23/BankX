import { getWalletProvider } from "../config/wallet";
// import {
//   ArrowDownToLine,
//   CircleDollarSign,
//   Info,
//   Landmark,
//   Wallet,
//   ShieldCheck,
//   Percent,
//   Clock3,
// } from "lucide-react";

// import { useEffect, useState } from "react";
// import { ethers } from "ethers";

// import Sidebar from "../components/Sidebar";

// export default function Loans() {
//   const [wallet, setWallet] = useState("");
//   const [balance, setBalance] = useState("0");
//   const [connecting, setConnecting] = useState(false);
//   const [mobileMenu, setMobileMenu] = useState(false);

//   /* =========================================
//      CONNECT WALLET
//   ========================================= */

//   const connectWallet = async () => {
//     try {
//       if (!getWalletProvider()) {
//         alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
//         return;
//       }

//       setConnecting(true);

//       const provider = new ethers.BrowserProvider(
//         getWalletProvider()
//       );

//       const accounts = await provider.send(
//         "eth_requestAccounts",
//         []
//       );

//       if (!accounts.length) return;

//       const address = accounts[0];

//       setWallet(address);

//       const value = await provider.getBalance(address);

//       setBalance(
//         Number(ethers.formatEther(value)).toFixed(4)
//       );

//     } catch (error) {
//       console.error("Wallet connection failed:", error);
//     } finally {
//       setConnecting(false);
//     }
//   };


//   /* =========================================
//      CHECK WALLET
//   ========================================= */

//   useEffect(() => {
//     const checkWallet = async () => {
//       if (!getWalletProvider()) return;

//       try {
//         const provider =
//           new ethers.BrowserProvider(getWalletProvider());

//         const accounts = await provider.send(
//           "eth_accounts",
//           []
//         );

//         if (!accounts.length) return;

//         const address = accounts[0];

//         setWallet(address);

//         const value =
//           await provider.getBalance(address);

//         setBalance(
//           Number(ethers.formatEther(value)).toFixed(4)
//         );

//       } catch (error) {
//         console.error(error);
//       }
//     };

//     checkWallet();
//   }, []);


//   /* =========================================
//      WALLET EVENTS
//   ========================================= */

//   useEffect(() => {
//     if (!getWalletProvider()) return;

//     const handleAccountsChanged = async (accounts) => {
//       if (!accounts.length) {
//         setWallet("");
//         setBalance("0");
//         return;
//       }

//       const address = accounts[0];

//       setWallet(address);

//       const provider =
//         new ethers.BrowserProvider(
//           getWalletProvider()
//         );

//       const value =
//         await provider.getBalance(address);

//       setBalance(
//         Number(ethers.formatEther(value)).toFixed(4)
//       );
//     };

//     getWalletProvider().on(
//       "accountsChanged",
//       handleAccountsChanged
//     );

//     return () => {
//       getWalletProvider().removeListener(
//         "accountsChanged",
//         handleAccountsChanged
//       );
//     };
//   }, []);


//   return (
//     <div className="min-h-screen bg-[#f6f7fb] text-[#202238]">

//       {/* SIDEBAR */}

//       <Sidebar
//         mobileMenu={mobileMenu}
//         setMobileMenu={setMobileMenu}
//       />


//       {/* MAIN */}

//       <main className="min-h-screen lg:ml-[235px]">

//         {/* HEADER */}

//         <header className="sticky top-0 z-30 border-b border-[#e9e9f0] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">

//           <div className="flex items-center justify-between">

//             <div className="flex items-center gap-4">

//               <button
//                 onClick={() => setMobileMenu(true)}
//                 className="rounded-xl bg-[#f4f4fa] p-2.5 lg:hidden"
//               >
//                 <svg
//                   width="20"
//                   height="20"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>

//               <div>

//                 <h1 className="text-xl font-extrabold sm:text-2xl">
//                   Borrow
//                 </h1>

//                 <p className="mt-1 text-[11px] text-gray-400 sm:text-sm">
//                   Borrow assets through decentralized lending
//                 </p>

//               </div>

//             </div>


//             {/* WALLET */}

//             {!wallet ? (

//               <button
//                 onClick={connectWallet}
//                 disabled={connecting}
//                 className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:opacity-60 sm:px-5"
//               >
//                 <Wallet size={15} />

//                 {connecting
//                   ? "Connecting..."
//                   : "Connect Wallet"}
//               </button>

//             ) : (

//               <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">

//                 <span className="h-2 w-2 rounded-full bg-emerald-400" />

//                 <div className="hidden sm:block">

//                   <p className="text-[10px] font-bold">
//                     {wallet.slice(0, 6)}...
//                     {wallet.slice(-4)}
//                   </p>

//                   <p className="text-[9px] text-gray-400">
//                     {balance} ETH
//                   </p>

//                 </div>

//               </div>

//             )}

//           </div>

//         </header>


//         {/* CONTENT */}

//         <div className="p-5 sm:p-7 lg:p-8">

//           <div className="mx-auto max-w-7xl">


//             {/* PAGE INTRO */}

//             <div className="mb-7">

//               <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">
//                 Lending
//               </p>

//               <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
//                 Borrow assets
//               </h2>

//               <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
//                 Use your eligible collateral to access
//                 decentralized liquidity through BankX.
//               </p>

//             </div>


//             {/* =====================================
//                 STATS
//             ===================================== */}

//             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

//               <LoanCard
//                 icon={Landmark}
//                 title="Active Loans"
//                 value="—"
//                 description="From lending contract"
//               />

//               <LoanCard
//                 icon={CircleDollarSign}
//                 title="Available Credit"
//                 value="—"
//                 description={
//                   wallet
//                     ? "Wallet connected"
//                     : "Connect wallet"
//                 }
//               />

//               <LoanCard
//                 icon={ArrowDownToLine}
//                 title="Outstanding"
//                 value="—"
//                 description="Current debt"
//               />

//             </div>


//             {/* =====================================
//                 MAIN BORROW AREA
//             ===================================== */}

//             <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">


//               {/* BORROW CARD */}

//               <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">

//                 <div className="flex items-start justify-between">

//                   <div className="flex items-center gap-4">

//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
//                       <Landmark size={22} />
//                     </div>

//                     <div>

//                       <h3 className="text-xl font-extrabold">
//                         Borrow from BankX
//                       </h3>

//                       <p className="mt-1 text-xs text-gray-400 sm:text-sm">
//                         Borrow against eligible collateral.
//                       </p>

//                     </div>

//                   </div>

//                   <ShieldCheck
//                     size={21}
//                     className="text-emerald-500"
//                   />

//                 </div>


//                 {/* FORM AREA */}

//                 <div className="mt-7 rounded-2xl bg-[#fafafe] p-5 sm:p-7">

//                   {!wallet ? (

//                     <div className="py-8 text-center">

//                       <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
//                         <Wallet size={28} />
//                       </div>

//                       <h4 className="mt-5 text-lg font-extrabold">
//                         Connect your wallet
//                       </h4>

//                       <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-400">
//                         Connect a wallet to check your
//                         collateral, borrowing capacity and
//                         active loans.
//                       </p>

//                       <button
//                         onClick={connectWallet}
//                         disabled={connecting}
//                         className="mt-6 rounded-xl bg-[#6558d9] px-7 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:opacity-60"
//                       >
//                         {connecting
//                           ? "Connecting..."
//                           : "Connect Wallet"}
//                       </button>

//                     </div>

//                   ) : (

//                     <div>

//                       {/* WALLET */}

//                       <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">

//                         <div className="flex items-center gap-3">

//                           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
//                             <Wallet size={17} />
//                           </div>

//                           <div>

//                             <p className="text-[10px] text-gray-400">
//                               Connected wallet
//                             </p>

//                             <p className="mt-0.5 text-xs font-bold">
//                               {wallet.slice(0, 6)}...
//                               {wallet.slice(-4)}
//                             </p>

//                           </div>

//                         </div>

//                         <div className="text-right">

//                           <p className="text-[10px] text-gray-400">
//                             Balance
//                           </p>

//                           <p className="text-xs font-extrabold">
//                             {balance} ETH
//                           </p>

//                         </div>

//                       </div>


//                       {/* ASSET */}

//                       <div className="mt-5">

//                         <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                           Borrow Asset
//                         </label>

//                         <div className="mt-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">

//                           <div className="flex items-center gap-3">

//                             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-xs font-extrabold text-cyan-600">
//                               $
//                             </div>

//                             <div>

//                               <p className="text-xs font-bold">
//                                 Supported Asset
//                               </p>

//                               <p className="text-[9px] text-gray-400">
//                                 Available from protocol
//                               </p>

//                             </div>

//                           </div>

//                           <span className="text-xs font-bold text-gray-300">
//                             Select
//                           </span>

//                         </div>

//                       </div>


//                       {/* AMOUNT */}

//                       <div className="mt-5">

//                         <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                           Borrow Amount
//                         </label>

//                         <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3">

//                           <input
//                             type="number"
//                             placeholder="0.00"
//                             disabled
//                             className="w-full bg-transparent text-lg font-extrabold outline-none placeholder:text-gray-300"
//                           />

//                           <span className="text-xs font-bold text-gray-400">
//                             TOKEN
//                           </span>

//                         </div>

//                       </div>


//                       {/* BORROW BUTTON */}

//                       <button
//                         disabled
//                         className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-100 py-3.5 text-xs font-bold text-gray-400"
//                       >
//                         Borrow
//                       </button>

//                       <p className="mt-3 text-center text-[10px] text-gray-400">
//                         Lending smart contract integration
//                         required to enable borrowing.
//                       </p>

//                     </div>

//                   )}

//                 </div>

//               </div>


//               {/* HOW IT WORKS */}

//               <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">

//                 <div className="flex items-center gap-3">

//                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
//                     <Info size={20} />
//                   </div>

//                   <div>

//                     <h3 className="text-lg font-extrabold">
//                       How borrowing works
//                     </h3>

//                     <p className="text-[10px] text-gray-400">
//                       Simple decentralized lending
//                     </p>

//                   </div>

//                 </div>


//                 <div className="mt-7 space-y-6">

//                   <Step
//                     number="01"
//                     title="Deposit collateral"
//                     text="Supply eligible assets to secure your borrowing position."
//                   />

//                   <Step
//                     number="02"
//                     title="Borrow"
//                     text="Borrow supported assets within your available credit limit."
//                   />

//                   <Step
//                     number="03"
//                     title="Monitor"
//                     text="Track your loan, interest and collateral position."
//                   />

//                   <Step
//                     number="04"
//                     title="Repay"
//                     text="Repay your debt according to the protocol terms."
//                   />

//                 </div>


//                 <div className="mt-7 rounded-xl bg-violet-50 p-4">

//                   <div className="flex gap-3">

//                     <ShieldCheck
//                       size={17}
//                       className="shrink-0 text-violet-500"
//                     />

//                     <p className="text-[10px] leading-5 text-violet-700">
//                       Borrowing data will be read directly
//                       from the BankX smart contracts once
//                       the lending contract is connected.
//                     </p>

//                   </div>

//                 </div>

//               </div>

//             </div>


//             {/* =====================================
//                 ACTIVE LOANS
//             ===================================== */}

//             <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">

//               <div className="flex items-center justify-between">

//                 <div>

//                   <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//                     Lending
//                   </p>

//                   <h3 className="mt-1 text-xl font-extrabold">
//                     Your active loans
//                   </h3>

//                   <p className="mt-1 text-xs text-gray-400">
//                     Your borrowing positions from the blockchain
//                   </p>

//                 </div>

//                 <Clock3
//                   size={21}
//                   className="text-violet-500"
//                 />

//               </div>


//               <div className="mt-6 flex min-h-[210px] items-center justify-center rounded-2xl bg-[#fafafe]">

//                 <div className="max-w-sm text-center">

//                   <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-200 shadow-sm">
//                     <Landmark size={27} />
//                   </div>

//                   <p className="mt-4 text-sm font-bold text-gray-400">
//                     No active loans
//                   </p>

//                   <p className="mt-2 text-[11px] leading-5 text-gray-300">
//                     Your borrowing positions will appear
//                     here after they are loaded from the
//                     BankX lending contract.
//                   </p>

//                 </div>

//               </div>

//             </div>


//             {/* =====================================
//                 RISK NOTICE
//             ===================================== */}

//             <div className="mt-6 flex gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">

//               <Info
//                 size={20}
//                 className="mt-0.5 shrink-0 text-amber-500"
//               />

//               <div>

//                 <p className="text-xs font-bold text-amber-800">
//                   Borrowing involves risk
//                 </p>

//                 <p className="mt-1 text-[10px] leading-5 text-amber-700">
//                   Your collateral and loan information
//                   will depend on the BankX lending smart
//                   contract. Do not enter funds until the
//                   contract integration has been configured.
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>

//       </main>

//     </div>
//   );
// }


// /* =========================================
//    LOAN CARD
// ========================================= */

// function LoanCard({
//   icon: Icon,
//   title,
//   value,
//   description,
// }) {
//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

//       <div className="flex items-start justify-between">

//         <div>

//           <p className="text-[11px] font-semibold text-gray-400">
//             {title}
//           </p>

//           <h3 className="mt-2 text-2xl font-extrab8">
//             {value}
//           </h3>

//           <p className="mt-1 text-[10px] text-gray-400">
//             {description}
//           </p>

//         </div>

//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
//           <Icon size={18} />
//         </div>

//       </div>

//     </div>
//   );
// }


// /* =========================================
//    STEP
// ========================================= */

// function Step({
//   number,
//   title,
//   text,
// }) {
//   return (
//     <div className="flex gap-4">

//       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[10px] font-extrabold text-violet-600">
//         {number}
//       </div>

//       <div>

//         <p className="text-xs font-bold">
//           {title}
//         </p>

//         <p className="mt-1 text-[10px] leading-5 text-gray-400">
//           {text}
//         </p>

//       </div>

//     </div>
//   );
// }

import {
  ArrowDownToLine,
  CircleDollarSign,
  Info,
  Landmark,
  Wallet,
  ShieldCheck,
  Clock3,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Sidebar from "../components/Sidebar";
import { getLegacyBankXAddress } from "../config/contract";
import { getDeployment } from "../config/contract";
import { GOVERNANCE_ABI, LOAN_MANAGER_ABI } from "../config/ProtocolABIs";

// ======================================================
// ======================================================
// ABI matching your Solidity BankX contract
// ======================================================

const BANKX_ABI = [
  "function savings(address) view returns (uint256)",
  "function loans(address) view returns (uint256)",
  "function totalPool() view returns (uint256)",

  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function requestLoan(uint256 amount)",
  "function repayLoan() payable",

  "function getSavings() view returns (uint256)",
  "function getLoan() view returns (uint256)",
  "function getPoolBalance() view returns (uint256)",

  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event LoanRequested(address indexed borrower, uint256 amount)",
  "event LoanRepaid(address indexed borrower, uint256 amount)",
];

export default function Loans() {
  const [wallet, setWallet] = useState("");

  const [walletBalance, setWalletBalance] = useState("0");
  const [savings, setSavings] = useState("0");
  const [loan, setLoan] = useState("0");
  const [pool, setPool] = useState("0");

  const [borrowAmount, setBorrowAmount] = useState("");
  const [daoBorrowAmount, setDaoBorrowAmount] = useState("");
  const [daoRepayAmount, setDaoRepayAmount] = useState("");
  const [daoLoan, setDaoLoan] = useState(null);
  const [daoQuote, setDaoQuote] = useState({ principal: 0n, interest: 0n, total: 0n });
  const [daoRequest, setDaoRequest] = useState(null);
  const [daoPool, setDaoPool] = useState(0n);
  const [daoMaxAmount, setDaoMaxAmount] = useState(0n);
  const [daoInterestBps, setDaoInterestBps] = useState(0n);
  const [daoTermSeconds, setDaoTermSeconds] = useState(0n);
  const [daoOverdue, setDaoOverdue] = useState(false);
  const [daoError, setDaoError] = useState("");
  const [daoStatus, setDaoStatus] = useState("");
  const [daoSubmitting, setDaoSubmitting] = useState(false);

  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  // ======================================================
  // GET PROVIDER
  // ======================================================

  const getProvider = () => {
    if (!getWalletProvider()) {
      throw new Error("No wallet provider is available. Connect with WalletConnect or install a browser wallet.");
    }

    return new ethers.BrowserProvider(getWalletProvider());
  };

  // ======================================================
  // GET CONTRACT
  // ======================================================

  const getContract = async (signer = null) => {
    const provider = signer?.provider || getProvider();
    const chainId = (await provider.getNetwork()).chainId;
    const contractAddress = getLegacyBankXAddress(chainId);
    if (!contractAddress) throw new Error(`BankX is not configured for chain ${chainId}.`);
    if ((await provider.getCode(contractAddress)) === "0x") {
      throw new Error("No legacy BankX contract code exists at the configured address.");
    }

    return new ethers.Contract(
      contractAddress,
      BANKX_ABI,
      signer || provider
    );
  };

  const loadDaoLoanData = async (address) => {
    setDaoError("");
    try {
      const provider = getProvider();
      const chain = await provider.getNetwork();
      const deployment = getDeployment(chain.chainId);
      if (!deployment?.BankXLoanManager) {
        throw new Error(`DAO loans are not configured for chain ${chain.chainId.toString()}.`);
      }
      if ((await provider.getCode(deployment.BankXLoanManager)) === "0x") {
        throw new Error("No DAO loan manager code exists on the connected network.");
      }

      const manager = new ethers.Contract(deployment.BankXLoanManager, LOAN_MANAGER_ABI, provider);
      const [loan, quote, pendingId, poolBalance, maxAmount, interestBps, loanTerm] = await Promise.all([
        manager.loans(address),
        manager.repaymentQuote(address),
        manager.pendingRequest(address),
        provider.getBalance(deployment.BankXLoanManager),
        manager.maxLoanAmount(),
        manager.interestBps(),
        manager.loanTerm(),
      ]);
      setDaoLoan(loan.active ? loan : null);
      setDaoQuote({ principal: quote.principal, interest: quote.interest, total: quote.total });
      setDaoPool(poolBalance);
      setDaoMaxAmount(maxAmount);
      setDaoInterestBps(interestBps);
      setDaoTermSeconds(loanTerm);
      setDaoOverdue(loan.active ? await manager.isOverdue(address) : false);
      if (pendingId > 0n) {
        const request = await manager.requests(pendingId);
        setDaoRequest({ id: pendingId, amount: request.amount, status: Number(request.status) });
      } else {
        setDaoRequest(null);
      }
    } catch (error) {
      setDaoLoan(null);
      setDaoRequest(null);
      setDaoOverdue(false);
      setDaoError(error.shortMessage || error.message || "Unable to load DAO loan data.");
    }
  };

  // ======================================================
  // LOAD ALL BLOCKCHAIN DATA
  // ======================================================

  const loadData = async (address = wallet) => {
    if (!address) return;

    try {
      setRefreshing(true);

      const provider = getProvider();

      // Wallet ETH balance
      const walletValue = await provider.getBalance(address);

      setWalletBalance(
        Number(ethers.formatEther(walletValue)).toFixed(4)
      );

      // Contract
      const contract = await getContract();

      // Read user's savings
      const savingsValue = await contract.savings(address);

      // Read user's loan
      const loanValue = await contract.loans(address);

      // Read total pool
      const poolValue = await contract.totalPool();

      setSavings(
        Number(ethers.formatEther(savingsValue)).toFixed(4)
      );

      setLoan(
        Number(ethers.formatEther(loanValue)).toFixed(4)
      );

      setPool(
        Number(ethers.formatEther(poolValue)).toFixed(4)
      );

      await loadDaoLoanData(address);

    } catch (error) {
      console.error("Failed to load BankX data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ======================================================
  // CONNECT WALLET
  // ======================================================

  const connectWallet = async () => {
    try {
      if (!getWalletProvider()) {
        alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
        return;
      }

      setConnecting(true);

      const provider = getProvider();

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      if (!accounts.length) return;

      const address = accounts[0];

      setWallet(address);

      await loadData(address);

    } catch (error) {
      console.error("Wallet connection failed:", error);

      alert(
        error?.message ||
          "Failed to connect wallet."
      );

    } finally {
      setConnecting(false);
    }
  };

  // ======================================================
  // CHECK EXISTING WALLET
  // ======================================================

  useEffect(() => {
    const checkWallet = async () => {
      if (!getWalletProvider()) return;

      try {
        const provider = getProvider();

        const accounts = await provider.send(
          "eth_accounts",
          []
        );

        if (!accounts.length) return;

        const address = accounts[0];

        setWallet(address);

        await loadData(address);

      } catch (error) {
        console.error(
          "Existing wallet check failed:",
          error
        );
      }
    };

    checkWallet();
  }, []);

  // ======================================================
  // WALLET EVENTS
  // ======================================================

  useEffect(() => {
    if (!getWalletProvider()) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setWallet("");
        setWalletBalance("0");
        setSavings("0");
        setLoan("0");
        setPool("0");
        return;
      }

      const address = accounts[0];

      setWallet(address);

      await loadData(address);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    getWalletProvider().on(
      "accountsChanged",
      handleAccountsChanged
    );

    getWalletProvider().on(
      "chainChanged",
      handleChainChanged
    );

    return () => {
      getWalletProvider().removeListener(
        "accountsChanged",
        handleAccountsChanged
      );

      getWalletProvider().removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  // ======================================================
  // REFRESH
  // ======================================================

  const refreshData = async () => {
    await loadData();
  };

  // ======================================================
  // AVAILABLE CREDIT
  //
  // Simple rule for your current contract:
  //
  // credit = savings - active loan
  //
  // It cannot be negative.
  // ======================================================

  const availableCredit = Math.max(
    0,
    Number(savings) - Number(loan)
  );

  // ======================================================
  // BORROW
  // ======================================================

  const handleBorrow = async () => {
    try {
      if (!wallet) {
        alert("Connect your wallet first.");
        return;
      }

      if (!borrowAmount || Number(borrowAmount) <= 0) {
        alert("Enter a valid borrow amount.");
        return;
      }

      const amount = Number(borrowAmount);

      if (amount > availableCredit) {
        alert(
          `Borrow amount exceeds your available credit of ${availableCredit.toFixed(
            4
          )} ETH.`
        );
        return;
      }

      if (amount > Number(pool)) {
        alert(
          `BankX pool only has ${pool} ETH available.`
        );
        return;
      }

      setLoading(true);

      const provider = getProvider();

      const signer = await provider.getSigner();

      const contract = await getContract(signer);

      console.log(
        "Requesting loan:",
        borrowAmount,
        "ETH"
      );

      const tx = await contract.requestLoan(
        ethers.parseEther(borrowAmount)
      );

      console.log(
        "Borrow transaction:",
        tx.hash
      );

      await tx.wait();

      console.log("Loan confirmed.");

      setBorrowAmount("");

      await loadData(wallet);

      alert("Loan borrowed successfully.");

    } catch (error) {
      console.error(
        "Borrow transaction failed:",
        error
      );

      if (error?.reason) {
        alert(error.reason);
      } else if (error?.shortMessage) {
        alert(error.shortMessage);
      } else {
        alert(
          error?.message ||
            "Borrow transaction failed."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const submitDaoRequest = async () => {
    if (!wallet || !daoBorrowAmount) return;
    setDaoSubmitting(true);
    setDaoError("");
    setDaoStatus("Awaiting wallet confirmation...");
    try {
      const provider = getProvider();
      const chain = await provider.getNetwork();
      const deployment = getDeployment(chain.chainId);
      if (!deployment?.BankXLoanManager) throw new Error("DAO loan manager is not deployed for this network.");
      const manager = new ethers.Contract(deployment.BankXLoanManager, LOAN_MANAGER_ABI, await provider.getSigner());
      const amount = ethers.parseEther(daoBorrowAmount);
      const maxAmount = await manager.maxLoanAmount();
      if (amount <= 0n || amount > maxAmount) throw new Error(`Request must be between 0 and ${ethers.formatEther(maxAmount)} ETH.`);

      const tx = await manager.submitLoanRequest(amount);
      setDaoStatus(`Request submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      const log = receipt.logs.map((entry) => {
        try { return manager.interface.parseLog(entry); } catch { return null; }
      }).find((entry) => entry?.name === "LoanRequested");
      setDaoBorrowAmount("");
      setDaoStatus(log ? `Loan request #${log.args.requestId.toString()} is awaiting a DAO proposal.` : "Loan request submitted.");
      await loadDaoLoanData(wallet);
    } catch (error) {
      setDaoError(error.shortMessage || error.reason || error.message || "Loan request failed.");
      setDaoStatus("");
    } finally {
      setDaoSubmitting(false);
    }
  };

  const createLoanApprovalProposal = async () => {
    if (!daoRequest || !wallet) return;
    setDaoSubmitting(true);
    setDaoError("");
    setDaoStatus("Awaiting wallet confirmation...");
    try {
      const provider = getProvider();
      const chain = await provider.getNetwork();
      const deployment = getDeployment(chain.chainId);
      if (!deployment?.BankXGovernance) throw new Error("Governance is not deployed for this network.");
      const managerInterface = new ethers.Interface(LOAN_MANAGER_ABI);
      const governance = new ethers.Contract(deployment.BankXGovernance, GOVERNANCE_ABI, await provider.getSigner());
      const callData = managerInterface.encodeFunctionData("approveRequest", [daoRequest.id]);
      const tx = await governance.propose(
        [deployment.BankXLoanManager],
        [callData],
        `Approve ${ethers.formatEther(daoRequest.amount)} ETH loan request #${daoRequest.id.toString()}`,
      );
      setDaoStatus(`Proposal submitted: ${tx.hash}`);
      await tx.wait();
      setDaoStatus("Approval proposal created. BANK holders can now vote.");
    } catch (error) {
      setDaoError(error.shortMessage || error.reason || error.message || "Proposal creation failed.");
      setDaoStatus("");
    } finally {
      setDaoSubmitting(false);
    }
  };

  const repayDaoLoan = async () => {
    if (!daoRepayAmount || !wallet) return;
    setDaoSubmitting(true);
    setDaoError("");
    setDaoStatus("Awaiting wallet confirmation...");
    try {
      const provider = getProvider();
      const chain = await provider.getNetwork();
      const deployment = getDeployment(chain.chainId);
      if (!deployment?.BankXLoanManager) throw new Error("DAO loan manager is not deployed for this network.");
      const manager = new ethers.Contract(deployment.BankXLoanManager, LOAN_MANAGER_ABI, await provider.getSigner());
      const amount = ethers.parseEther(daoRepayAmount);
      if (amount <= 0n || amount > daoQuote.total) throw new Error("Repayment exceeds the current quoted debt.");
      const tx = await manager.repay({ value: amount });
      setDaoStatus(`Repayment submitted: ${tx.hash}`);
      await tx.wait();
      setDaoRepayAmount("");
      setDaoStatus("Repayment confirmed.");
      await loadDaoLoanData(wallet);
    } catch (error) {
      setDaoError(error.shortMessage || error.reason || error.message || "Repayment failed.");
      setDaoStatus("");
    } finally {
      setDaoSubmitting(false);
    }
  };

  // ======================================================
  // FORMAT ADDRESS
  // ======================================================

  const shortAddress = wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#202238]">

      {/* SIDEBAR */}

      <Sidebar
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      {/* MAIN */}

      <main className="min-h-screen lg:ml-[235px]">

        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-[#e9e9f0] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                onClick={() =>
                  setMobileMenu(true)
                }
                className="rounded-xl bg-[#f4f4fa] p-2.5 lg:hidden"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>

                <h1 className="text-xl font-extrabold sm:text-2xl">
                  Borrow
                </h1>

                <p className="mt-1 text-[11px] text-gray-400 sm:text-sm">
                  Borrow assets through decentralized lending
                </p>

              </div>

            </div>

            {/* WALLET */}

            {!wallet ? (

              <button
                onClick={connectWallet}
                disabled={connecting}
                className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:opacity-60 sm:px-5"
              >
                <Wallet size={15} />

                {connecting
                  ? "Connecting..."
                  : "Connect Wallet"}
              </button>

            ) : (

              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <div className="hidden sm:block">

                  <p className="text-[10px] font-bold">
                    {shortAddress}
                  </p>

                  <p className="text-[9px] text-gray-400">
                    {walletBalance} ETH
                  </p>

                </div>

              </div>

            )}

          </div>

        </header>

        {/* CONTENT */}

        <div className="p-5 sm:p-7 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* INTRO */}

            <div className="mb-7">

              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">
                Lending
              </p>

              <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
                Borrow assets
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Use your BankX savings position to
                access decentralized liquidity.
              </p>

            </div>

            {/* =================================================
                STATS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <LoanCard
                icon={Landmark}
                title="Active Loans"
                value={`${loan} ETH`}
                description="Current BankX loan"
              />

              <LoanCard
                icon={CircleDollarSign}
                title="Available Credit"
                value={`${availableCredit.toFixed(4)} ETH`}
                description="Based on your savings"
              />

              <LoanCard
                icon={ArrowDownToLine}
                title="Outstanding"
                value={`${loan} ETH`}
                description="Current debt"
              />

            </div>

            {/* =================================================
                BORROW + HOW IT WORKS
            ================================================= */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

              {/* BORROW CARD */}

              <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                      <Landmark size={22} />
                    </div>

                    <div>

                      <h3 className="text-xl font-extrabold">
                        Borrow from BankX
                      </h3>

                      <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                        Borrow ETH against your savings.
                      </p>

                    </div>

                  </div>

                  <ShieldCheck
                    size={21}
                    className="text-emerald-500"
                  />

                </div>

                {/* FORM */}

                <div className="mt-7 rounded-2xl bg-[#fafafe] p-5 sm:p-7">

                  {!wallet ? (

                    <div className="py-8 text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                        <Wallet size={28} />
                      </div>

                      <h4 className="mt-5 text-lg font-extrabold">
                        Connect your wallet
                      </h4>

                      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-400">
                        Connect a wallet to access your
                        BankX savings and borrowing
                        position.
                      </p>

                      <button
                        onClick={connectWallet}
                        disabled={connecting}
                        className="mt-6 rounded-xl bg-[#6558d9] px-7 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:opacity-60"
                      >
                        {connecting
                          ? "Connecting..."
                          : "Connect Wallet"}
                      </button>

                    </div>

                  ) : (

                    <div>

                      {/* WALLET INFO */}

                      <div className="rounded-xl border border-gray-100 bg-white p-4">

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                              <Wallet size={17} />
                            </div>

                            <div>

                              <p className="text-[10px] text-gray-400">
                                Connected wallet
                              </p>

                              <p className="mt-0.5 text-xs font-bold">
                                {shortAddress}
                              </p>

                            </div>

                          </div>

                          <div className="text-right">

                            <p className="text-[10px] text-gray-400">
                              Balance
                            </p>

                            <p className="text-xs font-extrabold">
                              {walletBalance} ETH
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* POSITION */}

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-xl border border-gray-100 bg-white p-4">

                          <p className="text-[10px] text-gray-400">
                            BankX Savings
                          </p>

                          <p className="mt-1 text-lg font-extrabold">
                            {savings} ETH
                          </p>

                        </div>

                        <div className="rounded-xl border border-gray-100 bg-white p-4">

                          <p className="text-[10px] text-gray-400">
                            Available Credit
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-violet-600">
                            {availableCredit.toFixed(4)} ETH
                          </p>

                        </div>

                      </div>

                      {/* ASSET */}

                      <div className="mt-5">

                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Borrow Asset
                        </label>

                        <div className="mt-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                              Ξ
                            </div>

                            <div>

                              <p className="text-xs font-bold">
                                ETH
                              </p>

                              <p className="text-[9px] text-gray-400">
                                BankX supported asset
                              </p>

                            </div>

                          </div>

                          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                            Available
                          </span>

                        </div>

                      </div>

                      {/* AMOUNT */}

                      <div className="mt-5">

                        <div className="flex items-center justify-between">

                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Borrow Amount
                          </label>

                          <button
                            onClick={() => {
                              if (availableCredit > 0) {
                                setBorrowAmount(
                                  availableCredit
                                    .toFixed(6)
                                    .replace(
                                      /\.?0+$/,
                                      ""
                                    )
                                );
                              }
                            }}
                            className="text-[10px] font-bold text-violet-500 hover:text-violet-700"
                          >
                            MAX
                          </button>

                        </div>

                        <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3">

                          <input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={borrowAmount}
                            onChange={(e) =>
                              setBorrowAmount(
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            className="w-full bg-transparent text-lg font-extrabold outline-none placeholder:text-gray-300"
                          />

                          <span className="text-xs font-bold text-gray-400">
                            ETH
                          </span>

                        </div>

                      </div>

                      {/* BORROW BUTTON */}

                      <button
                        onClick={handleBorrow}
                        disabled={
                          loading ||
                          availableCredit <= 0 ||
                          !borrowAmount ||
                          Number(borrowAmount) <= 0
                        }
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6558d9] py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                      >

                        {loading ? (
                          <>
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />

                            Processing...
                          </>
                        ) : (
                          "Borrow"
                        )}

                      </button>

                      {availableCredit <= 0 && (

                        <p className="mt-3 text-center text-[10px] text-amber-600">
                          Deposit ETH into BankX savings
                          before borrowing.
                        </p>

                      )}

                    </div>

                  )}

                </div>

              </div>

              {/* HOW IT WORKS */}

              <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                    <Info size={20} />
                  </div>

                  <div>

                    <h3 className="text-lg font-extrabold">
                      How borrowing works
                    </h3>

                    <p className="text-[10px] text-gray-400">
                      Simple decentralized lending
                    </p>

                  </div>

                </div>

                <div className="mt-7 space-y-6">

                  <Step
                    number="01"
                    title="Deposit collateral"
                    text="Deposit ETH into your BankX savings."
                  />

                  <Step
                    number="02"
                    title="Borrow"
                    text="Borrow ETH within your available credit."
                  />

                  <Step
                    number="03"
                    title="Monitor"
                    text="Track your active loan and remaining credit."
                  />

                  <Step
                    number="04"
                    title="Repay"
                    text="Repay your loan to restore your available credit."
                  />

                </div>

                <div className="mt-7 rounded-xl bg-violet-50 p-4">

                  <div className="flex gap-3">

                    <ShieldCheck
                      size={17}
                      className="shrink-0 text-violet-500"
                    />

                    <p className="text-[10px] leading-5 text-violet-700">
                      Your savings, loan and pool values
                      are read directly from the BankX
                      smart contract.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIVE LOANS
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Lending
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold">
                    Your active loans
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Borrowing positions from the blockchain
                  </p>

                </div>

                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="rounded-xl bg-violet-50 p-2.5 text-violet-600 transition hover:bg-violet-100"
                >

                  <RefreshCw
                    size={18}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                </button>

              </div>

              {Number(loan) > 0 ? (

                <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] text-gray-400">
                        Active ETH Loan
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-violet-700">
                        {loan} ETH
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-500">
                      <Landmark size={22} />
                    </div>

                  </div>

                </div>

              ) : (

                <div className="mt-6 flex min-h-[210px] items-center justify-center rounded-2xl bg-[#fafafe]">

                  <div className="max-w-sm text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-200 shadow-sm">
                      <Landmark size={27} />
                    </div>

                    <p className="mt-4 text-sm font-bold text-gray-400">
                      No active loans
                    </p>

                    <p className="mt-2 text-[11px] leading-5 text-gray-300">
                      Your active BankX loan will
                      appear here after borrowing.
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* DAO-APPROVED LOANS */}

            <section className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">Governed lending</p>
                  <h3 className="mt-1 text-xl font-extrabold">DAO-approved ETH loans</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-400">Requests do not move funds until a proposal passes voting and the execution delay. Maximum per borrower: {daoMaxAmount ? `${ethers.formatEther(daoMaxAmount)} ETH` : "—"}; simple interest: {Number(daoInterestBps) / 100}% per {daoTermSeconds ? `${Number(daoTermSeconds) / 86400} days` : "—"}.</p>
                </div>
                <div className="rounded-xl bg-cyan-50 px-4 py-3 text-right">
                  <p className="text-[10px] text-gray-400">DAO loan pool</p>
                  <p className="mt-1 text-lg font-extrabold">{ethers.formatEther(daoPool)} ETH</p>
                </div>
              </div>

              {daoError && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">{daoError}</p>}
              {daoStatus && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">{daoStatus}</p>}

              {!wallet ? (
                <p className="mt-5 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">Connect a wallet to request a DAO loan.</p>
              ) : daoError.includes("not configured") ? (
                <p className="mt-3 text-xs text-gray-500">Deploy and configure the protocol on this network to enable DAO loans.</p>
              ) : (
                <>
                  {!daoLoan && !daoRequest && <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="text-xs font-semibold text-gray-600">Loan request amount (ETH)
                      <input type="number" min="0" max={daoMaxAmount ? ethers.formatEther(daoMaxAmount) : undefined} step="0.000001" value={daoBorrowAmount} onChange={(event) => setDaoBorrowAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" />
                    </label>
                    <button onClick={submitDaoRequest} disabled={daoSubmitting || !daoBorrowAmount || Number(daoBorrowAmount) <= 0 || (daoMaxAmount > 0n && ethers.parseEther(daoBorrowAmount || "0") > daoMaxAmount)} className="self-end rounded-xl bg-[#6558d9] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{daoSubmitting ? "Processing..." : "Submit loan request"}</button>
                  </div>}

                  {daoRequest && <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-xs font-bold text-amber-800">Pending request #{daoRequest.id.toString()}</p><p className="mt-1 text-xs text-amber-700">{ethers.formatEther(daoRequest.amount)} ETH · waiting for a DAO approval proposal</p></div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={createLoanApprovalProposal} disabled={daoSubmitting} className="rounded-lg bg-[#6558d9] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Create approval proposal</button>
                        <button onClick={async () => {
                          setDaoSubmitting(true);
                          try {
                            const provider = getProvider();
                            const chain = await provider.getNetwork();
                            const deployment = getDeployment(chain.chainId);
                            const manager = new ethers.Contract(deployment.BankXLoanManager, LOAN_MANAGER_ABI, await provider.getSigner());
                            const tx = await manager.cancelRequest(daoRequest.id);
                            setDaoStatus(`Cancellation submitted: ${tx.hash}`);
                            await tx.wait();
                            await loadDaoLoanData(wallet);
                          } catch (cancelError) {
                            setDaoError(cancelError.shortMessage || cancelError.message || "Cancellation failed.");
                          } finally {
                            setDaoSubmitting(false);
                          }
                        }} disabled={daoSubmitting} className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-xs font-bold text-amber-800 disabled:opacity-50">Cancel request</button>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] text-amber-700">Creating the proposal requires at least 100 eligible BANK at the prior-block snapshot.</p>
                  </div>}

                  {daoLoan && <div className="mt-5 rounded-xl border border-gray-100 bg-[#fafafe] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-xs font-bold">Active DAO loan</p><p className="mt-1 text-[11px] text-gray-500">Principal {ethers.formatEther(daoQuote.principal)} ETH · accrued interest {ethers.formatEther(daoQuote.interest)} ETH</p><p className="mt-1 text-[11px] text-gray-500">Total quoted repayment {ethers.formatEther(daoQuote.total)} ETH · due {new Date(Number(daoLoan.maturity) * 1000).toLocaleString()}</p></div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${daoOverdue ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{daoOverdue ? "OVERDUE" : "ACTIVE"}</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <label className="text-xs font-semibold text-gray-600">Partial or full repayment (ETH)
                        <input type="number" min="0" max={ethers.formatEther(daoQuote.total)} step="0.000001" value={daoRepayAmount} onChange={(event) => setDaoRepayAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                      </label>
                      <button onClick={repayDaoLoan} disabled={daoSubmitting || !daoRepayAmount || Number(daoRepayAmount) <= 0 || (daoQuote.total > 0n && ethers.parseEther(daoRepayAmount || "0") > daoQuote.total)} className="self-end rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">Repay loan</button>
                    </div>
                  </div>}
                </>
              )}
            </section>

            {/* =================================================
                POOL
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] text-gray-400">
                    BankX Pool
                  </p>

                  <p className="mt-1 text-xl font-extrabold">
                    {pool} ETH
                  </p>

                </div>

                <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                  <Landmark size={19} />
                </div>

              </div>

              <p className="mt-2 text-[10px] text-gray-400">
                ETH currently tracked by the BankX
                contract pool.
              </p>

            </div>

            {/* RISK */}

            <div className="mt-6 flex gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">

              <Info
                size={20}
                className="mt-0.5 shrink-0 text-amber-500"
              />

              <div>

                <p className="text-xs font-bold text-amber-800">
                  Borrowing involves risk
                </p>

                <p className="mt-1 text-[10px] leading-5 text-amber-700">
                  This BankX contract currently uses
                  your savings position to determine
                  available borrowing credit. Test
                  carefully on Sepolia before using
                  real funds.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


/* ======================================================
   LOAN CARD
====================================================== */

function LoanCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-extrabold">
            {value}
          </h3>

          <p className="mt-1 text-[10px] text-gray-400">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
          <Icon size={18} />
        </div>

      </div>

    </div>
  );
}


/* ======================================================
   STEP
====================================================== */

function Step({
  number,
  title,
  text,
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[10px] font-extrabold text-violet-600">
        {number}
      </div>

      <div>

        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-gray-400">
          {text}
        </p>

      </div>

    </div>
  );
}
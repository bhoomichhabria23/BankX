import { getWalletProvider } from "../config/wallet";
// import {
//   Activity,
//   BarChart3,
//   Bell,
//   CircleDollarSign,
//   Landmark,
//   PieChart,
//   Sparkles,
//   Wallet,
// } from "lucide-react";

// import { useEffect, useState } from "react";
// import { ethers } from "ethers";

// import Sidebar from "../components/Sidebar";

// export default function Dashboard() {

//   const [walletAddress, setWalletAddress] = useState("");
//   const [ethBalance, setEthBalance] = useState("0");
//   const [networkName, setNetworkName] = useState("");
//   const [connecting, setConnecting] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [dashboardData, setDashboardData] = useState({
//     totalPortfolio: "0",
//     totalSavings: "0",
//     activeLoans: "0",
//     allocation: [],
//     positions: [],
//     transactions: [],
//   });

//   /* ================================
//      CONNECT WALLET
//   ================================= */

//   const connectWallet = async () => {

//     try {

//       if (!getWalletProvider()) {
//         alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
//         return;
//       }

//       setConnecting(true);

//       const provider =
//         new ethers.BrowserProvider(
//           getWalletProvider()
//         );

//       const accounts =
//         await provider.send(
//           "eth_requestAccounts",
//           []
//         );

//       if (!accounts.length) return;

//       await updateWallet(
//         provider,
//         accounts[0]
//       );

//     } catch (error) {

//       console.error(
//         "Wallet connection failed:",
//         error
//       );

//     } finally {

//       setConnecting(false);

//     }
//   };

//   /* ================================
//      UPDATE WALLET
//   ================================= */

//   const updateWallet = async (
//     provider,
//     address
//   ) => {

//     try {

//       setWalletAddress(address);

//       const balance =
//         await provider.getBalance(address);

//       setEthBalance(
//         Number(
//           ethers.formatEther(balance)
//         ).toFixed(4)
//       );

//       const network =
//         await provider.getNetwork();

//       setNetworkName(
//         getNetworkName(network.chainId)
//       );

//       await loadBlockchainData(
//         provider,
//         address
//       );

//     } catch (error) {

//       console.error(
//         "Wallet update failed:",
//         error
//       );

//     }

//   };

//   /* ================================
//      BLOCKCHAIN DATA
//   ================================= */

//   const loadBlockchainData = async (
//     provider,
//     address
//   ) => {

//     try {

//       setLoading(true);

//       /*
//         BankX smart contract integration
//         goes here.

//         Example:

//         const contract = new ethers.Contract(
//           CONTRACT_ADDRESS,
//           CONTRACT_ABI,
//           provider
//         );

//         const savings =
//           await contract.getSavings(address);
//       */

//       setDashboardData({
//         totalPortfolio: "0",
//         totalSavings: "0",
//         activeLoans: "0",
//         allocation: [],
//         positions: [],
//         transactions: [],
//       });

//     } catch (error) {

//       console.error(
//         "Blockchain data error:",
//         error
//       );

//     } finally {

//       setLoading(false);

//     }

//   };

//   /* ================================
//      CHECK EXISTING WALLET
//   ================================= */

//   useEffect(() => {

//     const checkWallet = async () => {

//       if (!getWalletProvider()) return;

//       try {

//         const provider =
//           new ethers.BrowserProvider(
//             getWalletProvider()
//           );

//         const accounts =
//           await provider.send(
//             "eth_accounts",
//             []
//           );

//         if (accounts.length) {

//           await updateWallet(
//             provider,
//             accounts[0]
//           );

//         }

//       } catch (error) {

//         console.error(
//           "Wallet check failed:",
//           error
//         );

//       }

//     };

//     checkWallet();

//   }, []);

//   /* ================================
//      WALLET EVENTS
//   ================================= */

//   useEffect(() => {

//     if (!getWalletProvider()) return;

//     const accountsChanged =
//       async (accounts) => {

//         if (!accounts.length) {

//           setWalletAddress("");
//           setEthBalance("0");
//           setNetworkName("");

//           setDashboardData({
//             totalPortfolio: "0",
//             totalSavings: "0",
//             activeLoans: "0",
//             allocation: [],
//             positions: [],
//             transactions: [],
//           });

//           return;
//         }

//         const provider =
//           new ethers.BrowserProvider(
//             getWalletProvider()
//           );

//         await updateWallet(
//           provider,
//           accounts[0]
//         );

//       };

//     const chainChanged = () => {
//       window.location.reload();
//     };

//     getWalletProvider().on(
//       "accountsChanged",
//       accountsChanged
//     );

//     getWalletProvider().on(
//       "chainChanged",
//       chainChanged
//     );

//     return () => {

//       getWalletProvider().removeListener(
//         "accountsChanged",
//         accountsChanged
//       );

//       getWalletProvider().removeListener(
//         "chainChanged",
//         chainChanged
//       );

//     };

//   }, []);

//   const shortAddress =
//     walletAddress
//       ? `${walletAddress.slice(
//           0,
//           6
//         )}...${walletAddress.slice(-4)}`
//       : "";

//   return (
//     <div className="min-h-screen bg-[#f6f7fb] text-[#202238]">

//       <Sidebar />

//       <main className="min-h-screen lg:ml-[245px]">

//         {/* HEADER */}

//         <header className="sticky top-0 z-30 border-b border-[#e9e9f0] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">

//           <div className="flex items-center justify-between gap-4">

//             <div className="pl-12 lg:pl-0">

//               <h2 className="text-lg font-bold">
//                 Dashboard
//               </h2>

//               <p className="text-[11px] text-gray-400">
//                 Your decentralized finance overview
//               </p>

//             </div>

//             <div className="flex items-center gap-3">

//               {walletAddress && (
//                 <div className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 sm:flex">

//                   <span className="h-2 w-2 rounded-full bg-emerald-400" />

//                   <span className="text-[11px] font-semibold text-gray-500">
//                     {networkName}
//                   </span>

//                 </div>
//               )}

//               <button className="relative rounded-xl border border-gray-100 bg-white p-2.5">

//                 <Bell
//                   size={18}
//                   className="text-gray-500"
//                 />

//                 <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500" />

//               </button>

//               {!walletAddress ? (

//                 <button
//                   onClick={connectWallet}
//                   disabled={connecting}
//                   className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 disabled:opacity-60"
//                 >

//                   <Wallet size={15} />

//                   {connecting
//                     ? "Connecting..."
//                     : "Connect Wallet"}

//                 </button>

//               ) : (

//                 <div className="hidden items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2 sm:flex">

//                   <span className="h-2 w-2 rounded-full bg-emerald-400" />

//                   <div>

//                     <p className="text-[11px] font-bold">
//                       {shortAddress}
//                     </p>

//                     <p className="text-[9px] text-gray-400">
//                       {ethBalance} ETH
//                     </p>

//                   </div>

//                 </div>

//               )}

//             </div>

//           </div>

//         </header>

//         {/* CONTENT */}

//         <div className="p-5 sm:p-7">

//           <div className="mx-auto max-w-[1500px]">

//             {/* WELCOME */}

//             <div className="mb-7">

//               <p className="text-[12px] font-medium text-gray-400">
//                 Welcome to BankX 👋
//               </p>

//               <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
//                 Your portfolio overview
//               </h1>

//               <p className="mt-2 text-sm text-gray-400">
//                 Monitor your savings, borrowing and
//                 decentralized assets.
//               </p>

//             </div>

//             {/* STATS */}

//             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

//               <Stat
//                 title="Total Portfolio"
//                 value={dashboardData.totalPortfolio}
//                 suffix="USD"
//                 icon={PieChart}
//                 iconBg="bg-violet-100"
//                 iconColor="text-violet-600"
//                 loading={loading}
//               />

//               <Stat
//                 title="Total Savings"
//                 value={dashboardData.totalSavings}
//                 suffix="USD"
//                 icon={CircleDollarSign}
//                 iconBg="bg-emerald-100"
//                 iconColor="text-emerald-600"
//                 loading={loading}
//               />

//               <Stat
//                 title="Active Loans"
//                 value={dashboardData.activeLoans}
//                 suffix="USD"
//                 icon={Landmark}
//                 iconBg="bg-cyan-100"
//                 iconColor="text-cyan-600"
//                 loading={loading}
//               />

//             </div>

//             {/* CHART + ALLOCATION */}

//             <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">

//               <PortfolioChart
//                 value={dashboardData.totalPortfolio}
//               />

//               <AllocationCard
//                 allocation={
//                   dashboardData.allocation
//                 }
//               />

//             </div>

//             {/* POSITIONS + ACTIVITY */}

//             <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">

//               <PositionsCard
//                 positions={
//                   dashboardData.positions
//                 }
//               />

//               <ActivityCard
//                 transactions={
//                   dashboardData.transactions
//                 }
//               />

//             </div>

//             {/* WALLET */}

//             <WalletCard
//               walletAddress={walletAddress}
//               connectWallet={connectWallet}
//               connecting={connecting}
//             />

//           </div>

//         </div>

//       </main>

//     </div>
//   );
// }


// /* =========================================
//    STAT
// ========================================= */

// function Stat({
//   title,
//   value,
//   suffix,
//   icon: Icon,
//   iconBg,
//   iconColor,
//   loading,
// }) {

//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

//       <div className="flex items-start justify-between">

//         <div>

//           <p className="text-[11px] font-semibold text-gray-400">
//             {title}
//           </p>

//           {loading ? (

//             <div className="mt-3 h-7 w-28 animate-pulse rounded-lg bg-gray-100" />

//           ) : (

//             <h3 className="mt-2 text-2xl font-extrabold">
//               {value}
//             </h3>

//           )}

//           <p className="mt-1 text-[10px] text-gray-400">
//             {suffix}
//           </p>

//         </div>

//         <div
//           className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
//         >
//           <Icon size={19} />
//         </div>

//       </div>

//     </div>
//   );
// }


// /* =========================================
//    PORTFOLIO CHART
// ========================================= */

// function PortfolioChart({ value }) {

//   const [period, setPeriod] = useState("1M");

//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

//       <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

//         <div>

//           <p className="text-[11px] font-semibold text-gray-400">
//             Portfolio Overview
//           </p>

//           <h3 className="mt-1 text-2xl font-extrabold">
//             {value}
//           </h3>

//           <p className="mt-1 text-[10px] text-gray-400">
//             Live blockchain data
//           </p>

//         </div>

//         <div className="flex rounded-lg bg-gray-50 p-1">

//           {["1D", "1W", "1M", "6M", "1Y"].map(
//             (item) => (

//               <button
//                 key={item}
//                 onClick={() => setPeriod(item)}
//                 className={`rounded-md px-3 py-1.5 text-[10px] font-bold ${
//                   period === item
//                     ? "bg-white text-violet-600 shadow-sm"
//                     : "text-gray-400"
//                 }`}
//               >
//                 {item}
//               </button>

//             )
//           )}

//         </div>

//       </div>

//       <div className="mt-5 flex h-[220px] items-center justify-center rounded-xl bg-[#fafafe]">

//         <div className="text-center">

//           <BarChart3
//             size={35}
//             className="mx-auto text-gray-200"
//           />

//           <p className="mt-3 text-sm font-bold text-gray-400">
//             Portfolio history unavailable
//           </p>

//           <p className="mt-1 max-w-sm text-[10px] leading-5 text-gray-300">
//             Connect BankX smart contracts to
//             display your portfolio performance.
//           </p>

//         </div>

//       </div>

//     </div>
//   );
// }


// /* =========================================
//    ALLOCATION
// ========================================= */

// function AllocationCard({ allocation }) {

//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

//       <div className="flex items-center justify-between">

//         <div>

//           <p className="text-[11px] font-semibold text-gray-400">
//             Asset Allocation
//           </p>

//           <h3 className="mt-1 text-xl font-extrabold">
//             {allocation.length
//               ? `${allocation.length} Assets`
//               : "No Assets"}
//           </h3>

//         </div>

//         <PieChart
//           size={20}
//           className="text-violet-500"
//         />

//       </div>

//       <EmptyState
//         icon={PieChart}
//         title="No allocation data"
//         description="Your blockchain assets will appear here."
//       />

//     </div>
//   );
// }


// /* =========================================
//    POSITIONS
// ========================================= */

// function PositionsCard({ positions }) {

//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

//       <div>

//         <p className="text-[11px] font-semibold text-gray-400">
//           Your DeFi Positions
//         </p>

//         <h3 className="mt-1 text-xl font-extrabold">
//           Active positions
//         </h3>

//       </div>

//       {positions.length === 0 ? (

//         <EmptyState
//           icon={Wallet}
//           title="No active positions"
//           description="Your savings, vaults and liquidity positions will appear here."
//         />

//       ) : (

//         <div className="mt-5">
//           {/* Contract positions will be rendered here */}
//         </div>

//       )}

//     </div>
//   );
// }


// /* =========================================
//    ACTIVITY
// ========================================= */

// function ActivityCard({ transactions }) {

//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

//       <div className="flex items-center justify-between">

//         <div>

//           <p className="text-[11px] font-semibold text-gray-400">
//             Recent Activity
//           </p>

//           <h3 className="mt-1 text-xl font-extrabold">
//             Transactions
//           </h3>

//         </div>

//         <Activity
//           size={20}
//           className="text-violet-500"
//         />

//       </div>

//       {transactions.length === 0 ? (

//         <EmptyState
//           icon={Activity}
//           title="No transactions"
//           description="Your blockchain transactions will appear here."
//         />

//       ) : null}

//     </div>
//   );
// }


// /* =========================================
//    WALLET CARD
// ========================================= */

// function WalletCard({
//   walletAddress,
//   connectWallet,
//   connecting,
// }) {

//   return (
//     <div className="mt-5 rounded-2xl border border-[#e9e9f0] bg-white p-6">

//       <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

//         <div className="flex items-center gap-4">

//           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
//             <Wallet size={22} />
//           </div>

//           <div>

//             <p className="text-[11px] font-semibold text-gray-400">
//               Connected Wallet
//             </p>

//             <p className="mt-1 break-all text-sm font-bold">
//               {walletAddress || "No wallet connected"}
//             </p>

//           </div>

//         </div>

//         {!walletAddress && (

//           <button
//             onClick={connectWallet}
//             disabled={connecting}
//             className="rounded-xl bg-[#6558d9] px-6 py-3 text-[11px] font-bold text-white disabled:opacity-60"
//           >
//             {connecting
//               ? "Connecting..."
//               : "Connect Wallet"}
//           </button>

//         )}

//       </div>

//     </div>
//   );
// }


// /* =========================================
//    EMPTY STATE
// ========================================= */

// function EmptyState({
//   icon: Icon,
//   title,
//   description,
// }) {

//   return (
//     <div className="flex min-h-[170px] items-center justify-center">

//       <div className="max-w-[290px] text-center">

//         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
//           <Icon size={23} />
//         </div>

//         <p className="mt-3 text-sm font-bold text-gray-400">
//           {title}
//         </p>

//         <p className="mt-1 text-[10px] leading-5 text-gray-300">
//           {description}
//         </p>

//       </div>

//     </div>
//   );
// }


// /* =========================================
//    NETWORK
// ========================================= */

// function getNetworkName(chainId) {

//   const networks = {
//     "1": "Ethereum",
//     "11155111": "Sepolia",
//     "137": "Polygon",
//     "80002": "Polygon Amoy",
//     "8453": "Base",
//     "84532": "Base Sepolia",
//     "42161": "Arbitrum",
//     "31337": "Localhost",
//   };

//   const id = chainId.toString();

//   return networks[id] || `Chain ${id}`;
// }

import {
  Activity,
  Bell,
  CircleDollarSign,
  Landmark,
  PieChart,
  Wallet,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import {
  BANKX_ABI,
  getDeployment,
  getLegacyBankXAddress,
} from "../config/contract";
import {
  AMM_ABI,
  GOVERNANCE_ABI,
  LOAN_MANAGER_ABI,
  PRICE_FEED_ABI,
  STAKING_ABI,
  TOKEN_ABI,
  VAULT_ABI,
} from "../config/ProtocolABIs";

const EMPTY_DATA = {
  totalPortfolio: "0.0000",
  totalSavings: "0.0000",
  activeLoans: "0.0000",
  poolLiquidity: "0.0000",
  contractBalance: "0.0000",
  availableLiquidity: "0.0000",
};

const EMPTY_PROTOCOL_DATA = {
  bankBalance: "—",
  vaultShares: "—",
  vaultAssets: "—",
  lpBalance: "—",
  stakedBalance: "—",
  earnedRewards: "—",
  daoLoan: "—",
  daoDebt: "—",
  overdue: null,
  proposalCount: "—",
  votingPower: "—",
  ethUsd: "—",
  ethUsdUpdatedAt: null,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [networkName, setNetworkName] = useState("");

  const [dashboardData, setDashboardData] =
    useState(EMPTY_DATA);

  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [legacyConfigured, setLegacyConfigured] = useState(false);
  const [protocolError, setProtocolError] = useState("");
  const [protocolData, setProtocolData] = useState(EMPTY_PROTOCOL_DATA);

  /* =====================================================
     FORMAT ETH
  ===================================================== */

  const formatEth = (value) => {
    try {
      return Number(
        ethers.formatEther(value)
      ).toFixed(4);
    } catch {
      return "0.0000";
    }
  };

  const loadProtocolData = async (provider, address, chainId) => {
    const deployment = getDeployment(chainId);
    const requiredContracts = [
      "BankXToken",
      "BankXSavingsVault",
      "BankXAMM",
      "BankXStaking",
      "BankXLoanManager",
      "BankXGovernance",
      "BankXPriceFeed",
    ];
    if (!deployment || requiredContracts.some((name) => !deployment[name])) {
      setProtocolError(`One or more BankX protocol modules are not configured for chain ${chainId.toString()}.`);
      setProtocolData(EMPTY_PROTOCOL_DATA);
      return;
    }

    for (const name of requiredContracts) {
      if ((await provider.getCode(deployment[name])) === "0x") {
        setProtocolError(`${name} has no deployed code on this network.`);
        setProtocolData(EMPTY_PROTOCOL_DATA);
        return;
      }
    }

    try {
      const token = new ethers.Contract(deployment.BankXToken, TOKEN_ABI, provider);
      const vault = new ethers.Contract(deployment.BankXSavingsVault, VAULT_ABI, provider);
      const amm = new ethers.Contract(deployment.BankXAMM, AMM_ABI, provider);
      const staking = new ethers.Contract(deployment.BankXStaking, STAKING_ABI, provider);
      const loanManager = new ethers.Contract(deployment.BankXLoanManager, LOAN_MANAGER_ABI, provider);
      const governance = new ethers.Contract(deployment.BankXGovernance, GOVERNANCE_ABI, provider);
      const priceFeed = new ethers.Contract(deployment.BankXPriceFeed, PRICE_FEED_ABI, provider);

      const [bank, shares, lp, stake, rewards, loan, quote, proposals, votingPower, oracle] = await Promise.all([
        token.balanceOf(address),
        vault.balanceOf(address),
        amm.balanceOf(address),
        staking.stakedBalance(address),
        staking.earned(address),
        loanManager.loans(address),
        loanManager.repaymentQuote(address),
        governance.proposalCount(),
        token.getVotes(address),
        priceFeed.latestEthUsd(),
      ]);
      const vaultAssets = await vault.convertToAssets(shares);
      setProtocolData({
        bankBalance: ethers.formatEther(bank),
        vaultShares: ethers.formatEther(shares),
        vaultAssets: ethers.formatEther(vaultAssets),
        lpBalance: ethers.formatEther(lp),
        stakedBalance: ethers.formatEther(stake),
        earnedRewards: ethers.formatEther(rewards),
        daoLoan: loan.active ? ethers.formatEther(loan.principal) : "0",
        daoDebt: loan.active ? ethers.formatEther(quote.total) : "0",
        overdue: loan.active ? await loanManager.isOverdue(address) : false,
        proposalCount: proposals.toString(),
        votingPower: ethers.formatEther(votingPower),
        ethUsd: ethers.formatEther(oracle.price18),
        ethUsdUpdatedAt: Number(oracle.updatedAt),
      });
      setProtocolError("");
    } catch (protocolLoadError) {
      setProtocolError(protocolLoadError.shortMessage || protocolLoadError.reason || protocolLoadError.message || "Unable to read protocol data.");
    }
  };

  /* =====================================================
     LOAD BLOCKCHAIN DATA
  ===================================================== */

  const loadBlockchainData = async (
    provider,
    address
  ) => {
    try {
      setLoading(true);
      setError("");

      const chainId = (await provider.getNetwork()).chainId;
      const deployment = getDeployment(chainId);
      setNetworkName(deployment?.chainName || getNetworkName(chainId));
      const contractAddress = getLegacyBankXAddress(chainId);
      const walletEth =
        Number(
          ethers.formatEther(
            await provider.getBalance(address)
          )
        );

      let savingsEth = 0;
      let loanEth = 0;
      let poolEth = 0;
      let contractEth = 0;
      let legacyAvailable = false;
      if (contractAddress && (await provider.getCode(contractAddress)) !== "0x") {
        const contract = new ethers.Contract(contractAddress, BANKX_ABI, provider);
        const [poolBalance, savings, loan, contractBalance] = await Promise.all([
          contract.totalPool(),
          contract.savings(address),
          contract.loans(address),
          provider.getBalance(contractAddress),
        ]);
        savingsEth = Number(ethers.formatEther(savings));
        loanEth = Number(ethers.formatEther(loan));
        poolEth = Number(ethers.formatEther(poolBalance));
        contractEth = Number(ethers.formatEther(contractBalance));
        legacyAvailable = true;
      }
      setLegacyConfigured(legacyAvailable);

      setDashboardData({
        totalPortfolio: (walletEth + savingsEth).toFixed(4),
        totalSavings: savingsEth.toFixed(4),
        activeLoans: loanEth.toFixed(4),
        poolLiquidity: poolEth.toFixed(4),
        contractBalance: contractEth.toFixed(4),
        availableLiquidity: poolEth.toFixed(4),
      });
      await loadProtocolData(provider, address, chainId);

    } catch (error) {
      console.error(
        "Blockchain data error:",
        error
      );

      setError(
        error?.shortMessage ||
        error?.reason ||
        error?.message ||
        "Unable to load BankX data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UPDATE WALLET
  ===================================================== */

  const updateWallet = async (
    provider,
    address
  ) => {
    try {
      setWalletAddress(address);

      const balance =
        await provider.getBalance(address);

      setEthBalance(
        formatEth(balance)
      );

      const network =
        await provider.getNetwork();

      setNetworkName(
        getDeployment(network.chainId)?.chainName || getNetworkName(network.chainId)
      );

      await loadBlockchainData(
        provider,
        address
      );

    } catch (error) {
      console.error(
        "Wallet update failed:",
        error
      );

      setError(
        error?.shortMessage ||
        error?.message ||
        "Unable to update wallet."
      );
    }
  };

  /* =====================================================
     CONNECT WALLET
  ===================================================== */

  const connectWallet = async () => {
    try {
      if (!getWalletProvider()) {
        alert(
          "No browser wallet is available. Connect with WalletConnect or install a wallet extension."
        );
        return;
      }

      setConnecting(true);
      setError("");

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      const accounts =
        await provider.send(
          "eth_requestAccounts",
          []
        );

      if (!accounts.length) {
        return;
      }

      await updateWallet(
        provider,
        accounts[0]
      );

    } catch (error) {
      console.error(
        "Wallet connection failed:",
        error
      );

      setError(
        error?.shortMessage ||
        error?.message ||
        "Wallet connection failed."
      );
    } finally {
      setConnecting(false);
    }
  };

  /* =====================================================
     REFRESH
  ===================================================== */

  const refreshDashboard = async () => {
    try {
      if (!getWalletProvider()) return;

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      const accounts =
        await provider.send(
          "eth_accounts",
          []
        );

      if (accounts.length) {
        await updateWallet(
          provider,
          accounts[0]
        );
      }
    } catch (error) {
      console.error(
        "Refresh failed:",
        error
      );
    }
  };

  /* =====================================================
     INITIAL WALLET CHECK
  ===================================================== */

  useEffect(() => {
    const checkWallet = async () => {
      if (!getWalletProvider()) return;

      try {
        const provider =
          new ethers.BrowserProvider(
            getWalletProvider()
          );

        const accounts =
          await provider.send(
            "eth_accounts",
            []
          );

        if (accounts.length) {
          await updateWallet(
            provider,
            accounts[0]
          );
        } else {
          /*
           * Even without wallet connection,
           * show network if possible.
           */
          const network =
            await provider.getNetwork();

          setNetworkName(
            getDeployment(network.chainId)?.chainName || getNetworkName(network.chainId)
          );
          await loadProtocolData(provider, ethers.ZeroAddress, network.chainId);
        }
      } catch (error) {
        console.error(
          "Wallet check failed:",
          error
        );
      }
    };

    checkWallet();
  }, []);

  /* =====================================================
     WALLET EVENTS
  ===================================================== */

  useEffect(() => {
    if (!getWalletProvider()) return;

    const accountsChanged =
      async (accounts) => {
        if (!accounts.length) {
          setWalletAddress("");
          setEthBalance("0.0000");
          setLegacyConfigured(false);
          setDashboardData(
            EMPTY_DATA
          );
          const provider = new ethers.BrowserProvider(getWalletProvider());
          const network = await provider.getNetwork();
          await loadProtocolData(provider, ethers.ZeroAddress, network.chainId);
          return;
        }

        const provider =
          new ethers.BrowserProvider(
            getWalletProvider()
          );

        await updateWallet(
          provider,
          accounts[0]
        );
      };

    const chainChanged = async () => {
      window.location.reload();
    };

    getWalletProvider().on(
      "accountsChanged",
      accountsChanged
    );

    getWalletProvider().on(
      "chainChanged",
      chainChanged
    );

    return () => {
      getWalletProvider().removeListener(
        "accountsChanged",
        accountsChanged
      );

      getWalletProvider().removeListener(
        "chainChanged",
        chainChanged
      );
    };
  }, []);

  /* =====================================================
     DERIVED VALUES
  ===================================================== */

  const savings =
    Number(
      dashboardData.totalSavings
    );

  const loan =
    Number(
      dashboardData.activeLoans
    );

  const wallet =
    Number(ethBalance);

  const netPosition =
    savings - loan;

  const savingsPercent =
    dashboardData.totalPortfolio !==
      "0.0000"
      ? Math.min(
          100,
          (savings /
            Number(
              dashboardData.totalPortfolio
            )) *
            100
        )
      : 0;

  const loanPercent =
    dashboardData.totalPortfolio !==
      "0.0000"
      ? Math.min(
          100,
          (loan /
            Number(
              dashboardData.totalPortfolio
            )) *
            100
        )
      : 0;

  const walletPercent =
    Math.max(
      0,
      100 -
        savingsPercent -
        loanPercent
    );

  const shortAddress =
    walletAddress
      ? `${walletAddress.slice(
          0,
          6
        )}...${walletAddress.slice(-4)}`
      : "";

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#202238]">

      <Sidebar />

      <main className="min-h-screen lg:ml-[245px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-[#e9e9f0] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">

          <div className="flex items-center justify-between gap-4">

            <div className="pl-12 lg:pl-0">

              <h2 className="text-lg font-bold">
                Dashboard
              </h2>

              <p className="text-[11px] text-gray-400">
                Your decentralized finance overview
              </p>

            </div>

            <div className="flex items-center gap-3">

              {networkName && (
                <div className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 sm:flex">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[11px] font-semibold text-gray-500">
                    {networkName}
                  </span>

                </div>
              )}

              <button
                onClick={refreshDashboard}
                disabled={loading}
                className="rounded-xl border border-gray-100 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              <button onClick={() => navigate("/transactions")} title="View transaction activity" className="relative rounded-xl border border-gray-100 bg-white p-2.5">

                <Bell
                  size={18}
                  className="text-gray-500"
                />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500" />

              </button>

              {!walletAddress ? (

                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 disabled:opacity-60"
                >

                  <Wallet size={15} />

                  {connecting
                    ? "Connecting..."
                    : "Connect Wallet"}

                </button>

              ) : (

                <div className="hidden items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2 sm:flex">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <div>

                    <p className="text-[11px] font-bold">
                      {shortAddress}
                    </p>

                    <p className="text-[9px] text-gray-400">
                      {ethBalance} ETH
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-5 sm:p-7">

          <div className="mx-auto max-w-[1500px]">

            {/* WELCOME */}

            <div className="mb-7">

              <p className="text-[12px] font-medium text-gray-400">
                Welcome to BankX 👋
              </p>

              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                Your portfolio overview
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Monitor your savings, borrowing and
                decentralized assets in real time.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4">

                <div className="flex gap-3">

                  <Activity
                    size={18}
                    className="mt-0.5 text-red-500"
                  />

                  <div>

                    <p className="text-xs font-bold text-red-700">
                      Unable to load blockchain data
                    </p>

                    <p className="mt-1 break-all text-[11px] text-red-600">
                      {error}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {protocolError && (
              <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-800">
                Protocol data unavailable: {protocolError}
              </div>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <Stat
                title="Total Portfolio"
                value={
                  walletAddress ? dashboardData.totalPortfolio : "—"
                }
                suffix="ETH"
                icon={PieChart}
                iconBg="bg-violet-100"
                iconColor="text-violet-600"
                loading={loading}
              />

              <Stat
                title="Total Savings"
                value={
                  legacyConfigured ? dashboardData.totalSavings : "—"
                }
                suffix="ETH"
                icon={CircleDollarSign}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                loading={loading}
              />

              <Stat
                title="Active Loans"
                value={
                  legacyConfigured ? dashboardData.activeLoans : "—"
                }
                suffix="—"
                icon={Landmark}
                iconBg="bg-cyan-100"
                iconColor="text-cyan-600"
                loading={loading}
              />

            </div>

            {/* =================================================
                CHART + ALLOCATION
            ================================================= */}

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">

              <PortfolioChart
                wallet={wallet}
                savings={savings}
                loan={loan}
                portfolio={
                  Number(
                    dashboardData.totalPortfolio
                  )
                }
              />

              <AllocationCard
                wallet={wallet}
                savings={savings}
                loan={loan}
                walletPercent={
                  walletPercent
                }
                savingsPercent={
                  savingsPercent
                }
                loanPercent={
                  loanPercent
                }
              />

            </div>

            {/* =================================================
                BANKX MARKET
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-[#e9e9f0] bg-white p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-semibold text-gray-400">
                    BankX Protocol
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold">
                    Lending Market
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Live data from your BankX smart contract
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <TrendingUp size={20} />
                </div>

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <ProtocolMetric
                  title="Pool Liquidity"
                  value={legacyConfigured ? `${dashboardData.poolLiquidity} ETH` : "—"}
                />

                <ProtocolMetric
                  title="Available Liquidity"
                  value={legacyConfigured ? `${dashboardData.availableLiquidity} ETH` : "—"}
                />

                <ProtocolMetric
                  title="Contract Balance"
                  value={legacyConfigured ? `${dashboardData.contractBalance} ETH` : "—"}
                />

              </div>

            </div>

            <div className="mt-5 rounded-2xl border border-[#e9e9f0] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400">Live on-chain positions</p>
                  <h3 className="mt-1 text-xl font-extrabold">BANKX Protocol</h3>
                  <p className="mt-1 text-[10px] text-gray-400">Balances, debt, governance and oracle values are read from the connected chain.</p>
                </div>
                {protocolData.ethUsdUpdatedAt && <p className="text-[10px] text-gray-400">ETH/USD feed updated {new Date(protocolData.ethUsdUpdatedAt * 1000).toLocaleString()}</p>}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProtocolMetric title="BANK balance" value={`${protocolData.bankBalance} BANK`} />
                <ProtocolMetric title="Vault shares" value={`${protocolData.vaultShares} bxBANK`} />
                <ProtocolMetric title="Vault assets" value={`${protocolData.vaultAssets} BANK`} />
                <ProtocolMetric title="LP tokens" value={`${protocolData.lpBalance} bxLP`} />
                <ProtocolMetric title="Staked BANK" value={`${protocolData.stakedBalance} BANK`} />
                <ProtocolMetric title="Earned rewards" value={`${protocolData.earnedRewards} BANK`} />
                <ProtocolMetric title="DAO loan / debt" value={`${protocolData.daoLoan} / ${protocolData.daoDebt} ETH${protocolData.overdue ? " · OVERDUE" : ""}`} />
                <ProtocolMetric title="Voting power" value={`${protocolData.votingPower} BANK`} />
                <ProtocolMetric title="Proposals" value={protocolData.proposalCount} />
                <ProtocolMetric title="ETH / USD" value={protocolData.ethUsd === "—" ? "—" : `$${Number(protocolData.ethUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              </div>
            </div>

            {/* =================================================
                POSITIONS
            ================================================= */}

            <div className="mt-5">

              <PositionsCard
                savings={savings}
                loan={loan}
                netPosition={netPosition}
              />

            </div>

            {/* =================================================
                WALLET
            ================================================= */}

            <WalletCard
              walletAddress={
                walletAddress
              }
              connectWallet={
                connectWallet
              }
              connecting={
                connecting
              }
              ethBalance={
                ethBalance
              }
            />

          </div>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  suffix,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            {title}
          </p>

          {loading ? (

            <div className="mt-3 h-7 w-28 animate-pulse rounded-lg bg-gray-100" />

          ) : (

            <h3 className="mt-2 text-2xl font-extrabold">
              {value}
            </h3>

          )}

          <p className="mt-1 text-[10px] text-gray-400">
            {suffix}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PORTFOLIO CHART
========================================================= */

function PortfolioChart({
  wallet,
  savings,
  loan,
  portfolio,
}) {
  /*
   * This is a CURRENT PORTFOLIO BREAKDOWN,
   * not fabricated historical blockchain data.
   */

  const max =
    Math.max(
      wallet,
      savings,
      loan,
      0.001
    );

  const bars = [
    {
      label: "Wallet",
      value: wallet,
      height:
        (wallet / max) * 100,
    },
    {
      label: "Savings",
      value: savings,
      height:
        (savings / max) * 100,
    },
    {
      label: "Loan",
      value: loan,
      height:
        (loan / max) * 100,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            Portfolio Overview
          </p>

          <h3 className="mt-1 text-2xl font-extrabold">
            {portfolio.toFixed(4)} ETH
          </h3>

          <p className="mt-1 text-[10px] text-gray-400">
            Current wallet + BankX savings
          </p>

        </div>

        <div className="rounded-xl bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-600">
          LIVE
        </div>

      </div>

      {/* GRAPH */}

      <div className="mt-6 h-[250px] rounded-xl bg-[#fafafe] px-6 pb-5 pt-6">

        <div className="flex h-full items-end justify-around gap-8">

          {bars.map((bar) => (

            <div
              key={bar.label}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >

              <div className="mb-2 text-[10px] font-bold text-gray-500">
                {bar.value.toFixed(4)}
              </div>

              <div className="flex h-[170px] w-full max-w-[75px] items-end">

                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-[#6558d9] to-[#9188eb] transition-all duration-700"
                  style={{
                    height: `${Math.max(
                      bar.height,
                      bar.value > 0
                        ? 8
                        : 2
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-[10px] font-bold text-gray-400">
                {bar.label}
              </p>

            </div>

          ))}

        </div>

      </div>

      <div className="mt-4 flex items-center gap-5">

        <Legend
          label="Wallet"
        />

        <Legend
          label="Savings"
        />

        <Legend
          label="Loan"
        />

      </div>

    </div>
  );
}


/* =========================================================
   LEGEND
========================================================= */

function Legend({ label }) {
  return (
    <div className="flex items-center gap-2">

      <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

      <span className="text-[10px] font-semibold text-gray-400">
        {label}
      </span>

    </div>
  );
}


/* =========================================================
   ALLOCATION
========================================================= */

function AllocationCard({
  wallet,
  savings,
  loan,
  walletPercent,
  savingsPercent,
  loanPercent,
}) {
  const total =
    wallet + savings + loan;

  const walletDeg =
    total > 0
      ? (wallet / total) * 360
      : 0;

  const savingsDeg =
    total > 0
      ? (savings / total) * 360
      : 0;

  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            Asset Allocation
          </p>

          <h3 className="mt-1 text-xl font-extrabold">
            ETH Position
          </h3>

        </div>

        <PieChart
          size={20}
          className="text-violet-500"
        />

      </div>

      {/* DONUT */}

      <div className="mt-7 flex justify-center">

        <div
          className="relative flex h-44 w-44 items-center justify-center rounded-full"
          style={{
            background:
              total > 0
                ? `conic-gradient(
                    #6558d9 0deg ${walletDeg}deg,
                    #8b83e8 ${walletDeg}deg ${
                      walletDeg +
                      savingsDeg
                    }deg,
                    #67c5c5 ${
                      walletDeg +
                      savingsDeg
                    }deg 360deg
                  )`
                : "#eeeeF5",
          }}
        >

          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">

            <p className="text-[9px] font-semibold text-gray-400">
              TOTAL
            </p>

            <p className="mt-1 text-xl font-extrabold">
              {total.toFixed(4)}
            </p>

            <p className="text-[9px] text-gray-400">
              ETH
            </p>

          </div>

        </div>

      </div>

      {/* LEGEND */}

      <div className="mt-7 space-y-4">

        <AllocationRow
          label="Wallet"
          value={wallet}
          percentage={walletPercent}
          dot="bg-violet-500"
        />

        <AllocationRow
          label="Savings"
          value={savings}
          percentage={savingsPercent}
          dot="bg-indigo-400"
        />

        <AllocationRow
          label="Loan"
          value={loan}
          percentage={loanPercent}
          dot="bg-cyan-400"
        />

      </div>

    </div>
  );
}


/* =========================================================
   ALLOCATION ROW
========================================================= */

function AllocationRow({
  label,
  value,
  percentage,
  dot,
}) {
  return (
    <div>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`h-2.5 w-2.5 rounded-full ${dot}`}
          />

          <span className="text-[11px] font-semibold text-gray-500">
            {label}
          </span>

        </div>

        <span className="text-[10px] font-bold text-gray-500">
          {value.toFixed(4)} ETH
        </span>

      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">

        <div
          className={`h-full rounded-full ${dot}`}
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   PROTOCOL METRIC
========================================================= */

function ProtocolMetric({
  title,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#fafafe] p-4">

      <p className="text-[10px] font-semibold text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-extrabold">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   POSITIONS
========================================================= */

function PositionsCard({
  savings,
  loan,
  netPosition,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            Your DeFi Positions
          </p>

          <h3 className="mt-1 text-xl font-extrabold">
            Active positions
          </h3>

        </div>

        <ShieldCheck
          size={21}
          className="text-violet-500"
        />

      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">

        <Position
          title="Savings"
          value={`${savings.toFixed(4)} ETH`}
          icon={Wallet}
        />

        <Position
          title="Active Loan"
          value={`${loan.toFixed(4)} ETH`}
          icon={Landmark}
        />

        <Position
          title="Net Position"
          value={`${netPosition.toFixed(4)} ETH`}
          icon={ShieldCheck}
        />

      </div>

    </div>
  );
}


/* =========================================================
   POSITION
========================================================= */

function Position({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl bg-[#fafafe] p-4">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-semibold text-gray-400">
          {title}
        </p>

        <Icon
          size={16}
          className="text-violet-500"
        />

      </div>

      <p className="mt-3 text-lg font-extrabold">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   WALLET CARD
========================================================= */

function WalletCard({
  walletAddress,
  connectWallet,
  connecting,
  ethBalance,
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#e9e9f0] bg-white p-6">

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Wallet size={22} />
          </div>

          <div>

            <p className="text-[11px] font-semibold text-gray-400">
              Connected Wallet
            </p>

            <p className="mt-1 break-all text-sm font-bold">
              {walletAddress ||
                "No wallet connected"}
            </p>

            {walletAddress && (
              <p className="mt-1 text-[10px] text-gray-400">
                Balance: {ethBalance} ETH
              </p>
            )}

          </div>

        </div>

        {!walletAddress && (

          <button
            onClick={connectWallet}
            disabled={connecting}
            className="rounded-xl bg-[#6558d9] px-6 py-3 text-[11px] font-bold text-white disabled:opacity-60"
          >
            {connecting
              ? "Connecting..."
              : "Connect Wallet"}
          </button>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   NETWORK
========================================================= */

function getNetworkName(chainId) {
  const networks = {
    "1": "Ethereum",
    "11155111": "Sepolia",
    "137": "Polygon",
    "80002": "Polygon Amoy",
    "8453": "Base",
    "84532": "Base Sepolia",
    "42161": "Arbitrum",
    "31337": "Localhost",
  };

  const id =
    chainId.toString();

  return (
    networks[id] ||
    `Chain ${id}`
  );
}
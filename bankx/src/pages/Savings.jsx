import { getWalletProvider } from "../config/wallet";
// import {
//   ArrowDownLeft,
//   ArrowUpRight,
//   BarChart3,
//   Bell,
//   CircleDollarSign,
//   CreditCard,
//   Gem,
//   LayoutDashboard,
//   Landmark,
//   Menu,
//   Network,
//   Settings,
//   ShieldCheck,
//   Sparkles,
//   Wallet,
//   X,
//   Plus,
//   LockKeyhole,
//   Info,
//   RefreshCw,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ethers } from "ethers";

// /* =====================================================
//    BANKX CONTRACT
// ===================================================== */

// const CONTRACT_ADDRESS =
//   "0x8D470573BaFc992F060E3438bedf133a22F1a140";

// const BANKX_ABI = [
//   {
//     inputs: [],
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },

//   {
//     inputs: [],
//     name: "owner",
//     outputs: [
//       {
//         internalType: "address",
//         name: "",
//         type: "address",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "",
//         type: "address",
//       },
//     ],
//     name: "savings",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "",
//         type: "address",
//       },
//     ],
//     name: "loans",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     inputs: [],
//     name: "totalPool",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     inputs: [],
//     name: "deposit",
//     outputs: [],
//     stateMutability: "payable",
//     type: "function",
//   },

//   {
//     inputs: [
//       {
//         internalType: "uint256",
//         name: "amount",
//         type: "uint256",
//       },
//     ],
//     name: "withdraw",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },

//   {
//     inputs: [
//       {
//         internalType: "uint256",
//         name: "amount",
//         type: "uint256",
//       },
//     ],
//     name: "requestLoan",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },

//   {
//     inputs: [],
//     name: "repayLoan",
//     outputs: [],
//     stateMutability: "payable",
//     type: "function",
//   },

//   {
//     inputs: [],
//     name: "getSavings",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     inputs: [],
//     name: "getLoan",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     inputs: [],
//     name: "getPoolBalance",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },

//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "user",
//         type: "address",
//       },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "amount",
//         type: "uint256",
//       },
//     ],
//     name: "Deposited",
//     type: "event",
//   },

//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "user",
//         type: "address",
//       },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "amount",
//         type: "uint256",
//       },
//     ],
//     name: "Withdrawn",
//     type: "event",
//   },

//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "borrower",
//         type: "address",
//       },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "amount",
//         type: "uint256",
//       },
//     ],
//     name: "LoanRequested",
//     type: "event",
//   },

//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "borrower",
//         type: "address",
//       },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "amount",
//         type: "uint256",
//       },
//     ],
//     name: "LoanRepaid",
//     type: "event",
//   },
// ];

// /* =====================================================
//    MAIN COMPONENT
// ===================================================== */

// export default function Savings() {
//   const navigate = useNavigate();

//   const [mobileMenu, setMobileMenu] = useState(false);

//   const [walletAddress, setWalletAddress] = useState("");
//   const [ethBalance, setEthBalance] = useState("0");
//   const [networkName, setNetworkName] = useState("");

//   const [connecting, setConnecting] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [depositAmount, setDepositAmount] = useState("");
//   const [withdrawAmount, setWithdrawAmount] = useState("");

//   const [depositing, setDepositing] = useState(false);
//   const [withdrawing, setWithdrawing] = useState(false);

//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");

//   const [savingsData, setSavingsData] = useState({
//     totalSavings: "0",
//     availableBalance: "0",
//     loanBalance: "0",
//     poolBalance: "0",
//     positions: [],
//   });

//   /* =====================================================
//      CONNECT WALLET
//   ===================================================== */

//   const connectWallet = async () => {
//     try {
//       if (!getWalletProvider()) {
//         alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
//         return;
//       }

//       setConnecting(true);
//       clearMessage();

//       const provider = new ethers.BrowserProvider(
//         getWalletProvider()
//       );

//       const accounts = await provider.send(
//         "eth_requestAccounts",
//         []
//       );

//       if (!accounts || accounts.length === 0) {
//         return;
//       }

//       const address = accounts[0];

//       setWalletAddress(address);

//       await updateWalletInfo(
//         provider,
//         address
//       );

//       await loadSavingsData(
//         provider,
//         address
//       );

//     } catch (error) {
//       console.error(
//         "Wallet connection failed:",
//         error
//       );

//       showMessage(
//         getErrorMessage(error),
//         "error"
//       );
//     } finally {
//       setConnecting(false);
//     }
//   };

//   /* =====================================================
//      UPDATE WALLET INFO
//   ===================================================== */

//   const updateWalletInfo = async (
//     provider,
//     address
//   ) => {
//     const balance =
//       await provider.getBalance(address);

//     setEthBalance(
//       Number(
//         ethers.formatEther(balance)
//       ).toFixed(6)
//     );

//     const network =
//       await provider.getNetwork();

//     setNetworkName(
//       getNetworkName(network.chainId)
//     );
//   };

//   /* =====================================================
//      LOAD SAVINGS DATA
//   ===================================================== */

//   const loadSavingsData = async (
//     provider,
//     address = walletAddress
//   ) => {
//     try {
//       if (!provider || !address) {
//         return;
//       }

//       setLoading(true);

//       const contract =
//         new ethers.Contract(
//           CONTRACT_ADDRESS,
//           BANKX_ABI,
//           provider
//         );

//       const savings =
//         await contract.getSavings({
//           from: address,
//         });

//       const loan =
//         await contract.getLoan({
//           from: address,
//         });

//       const pool =
//         await contract.getPoolBalance();

//       const savingsETH =
//         ethers.formatEther(savings);

//       const loanETH =
//         ethers.formatEther(loan);

//       const poolETH =
//         ethers.formatEther(pool);

//       const savingsNumber =
//         Number(savingsETH);

//       setSavingsData({
//         totalSavings:
//           savingsNumber.toFixed(6),

//         availableBalance:
//           savingsNumber.toFixed(6),

//         loanBalance:
//           Number(loanETH).toFixed(6),

//         poolBalance:
//           Number(poolETH).toFixed(6),

//         positions:
//           savingsNumber > 0
//             ? [
//                 {
//                   id: "bankx-eth",
//                   icon: "Ξ",
//                   name: "ETH Savings",
//                   balance:
//                     `${savingsNumber.toFixed(6)} ETH`,
//                   value:
//                     `${savingsNumber.toFixed(6)} ETH`,
//                   status: "Active",
//                 },
//               ]
//             : [],
//       });

//     } catch (error) {
//       console.error(
//         "Failed to load savings:",
//         error
//       );

//       showMessage(
//         "Unable to read BankX contract.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =====================================================
//      DEPOSIT
//   ===================================================== */

//   const handleDeposit = async () => {
//     try {
//       if (!getWalletProvider()) {
//         alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
//         return;
//       }

//       if (!walletAddress) {
//         showMessage(
//           "Connect your wallet first.",
//           "error"
//         );
//         return;
//       }

//       const input =
//         depositAmount.trim();

//       if (!input) {
//         showMessage(
//           "Enter an amount to deposit.",
//           "error"
//         );
//         return;
//       }

//       const numericAmount =
//         Number(input);

//       if (
//         !Number.isFinite(
//           numericAmount
//         ) ||
//         numericAmount <= 0
//       ) {
//         showMessage(
//           "Enter a valid amount greater than 0.",
//           "error"
//         );
//         return;
//       }

//       /*
//        * Convert ETH to wei.
//        *
//        * ethers v6:
//        * parseEther()
//        *
//        * DO NOT use:
//        * ethers.isValidNumberish()
//        */

//       let amount;

//       try {
//         amount =
//           ethers.parseEther(input);
//       } catch (error) {
//         console.error(
//           "parseEther error:",
//           error
//         );

//         showMessage(
//           "Invalid ETH amount. Example: 0.01",
//           "error"
//         );

//         return;
//       }

//       const provider =
//         new ethers.BrowserProvider(
//           getWalletProvider()
//         );

//       const signer =
//         await provider.getSigner();

//       const signerAddress =
//         await signer.getAddress();

//       const contract =
//         new ethers.Contract(
//           CONTRACT_ADDRESS,
//           BANKX_ABI,
//           signer
//         );

//       /*
//        * Check wallet balance
//        */

//       const balance =
//         await provider.getBalance(
//           signerAddress
//         );

//       /*
//        * Make sure amount is not greater
//        * than wallet balance.
//        */

//       if (amount >= balance) {
//         showMessage(
//           "You need some ETH left to pay gas fees.",
//           "error"
//         );
//         return;
//       }

//       setDepositing(true);
//       clearMessage();

//       /*
//        * Send deposit transaction
//        */

//       const tx =
//         await contract.deposit({
//           value: amount,
//         });

//       console.log(
//         "Deposit transaction:",
//         tx.hash
//       );

//       showMessage(
//         "Deposit submitted. Waiting for confirmation...",
//         "success"
//       );

//       /*
//        * Wait for blockchain confirmation
//        */

//       await tx.wait();

//       setDepositAmount("");

//       /*
//        * Refresh wallet
//        */

//       await updateWalletInfo(
//         provider,
//         signerAddress
//       );

//       /*
//        * Refresh savings
//        */

//       await loadSavingsData(
//         provider,
//         signerAddress
//       );

//       showMessage(
//         "Deposit successful!",
//         "success"
//       );

//     } catch (error) {
//       console.error(
//         "Deposit failed:",
//         error
//       );

//       showMessage(
//         getErrorMessage(error),
//         "error"
//       );

//     } finally {
//       setDepositing(false);
//     }
//   };

//   /* =====================================================
//      WITHDRAW
//   ===================================================== */

//   const handleWithdraw = async () => {
//     try {
//       if (!getWalletProvider()) {
//         alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
//         return;
//       }

//       if (!walletAddress) {
//         showMessage(
//           "Connect your wallet first.",
//           "error"
//         );
//         return;
//       }

//       const input =
//         withdrawAmount.trim();

//       if (!input) {
//         showMessage(
//           "Enter an amount to withdraw.",
//           "error"
//         );
//         return;
//       }

//       const numericAmount =
//         Number(input);

//       if (
//         !Number.isFinite(
//           numericAmount
//         ) ||
//         numericAmount <= 0
//       ) {
//         showMessage(
//           "Enter a valid amount greater than 0.",
//           "error"
//         );
//         return;
//       }

//       /*
//        * Convert ETH to wei
//        */

//       let amount;

//       try {
//         amount =
//           ethers.parseEther(input);
//       } catch (error) {
//         console.error(
//           "parseEther error:",
//           error
//         );

//         showMessage(
//           "Invalid ETH amount. Example: 0.01",
//           "error"
//         );

//         return;
//       }

//       /*
//        * Get saved balance directly
//        * from contract.
//        */

//       const provider =
//         new ethers.BrowserProvider(
//           getWalletProvider()
//         );

//       const readContract =
//         new ethers.Contract(
//           CONTRACT_ADDRESS,
//           BANKX_ABI,
//           provider
//         );

//       const saved =
//         await readContract.getSavings({
//           from: walletAddress,
//         });

//       /*
//        * Check withdrawal amount.
//        */

//       if (amount > saved) {
//         showMessage(
//           "Withdrawal exceeds your savings balance.",
//           "error"
//         );
//         return;
//       }

//       const signer =
//         await provider.getSigner();

//       const contract =
//         new ethers.Contract(
//           CONTRACT_ADDRESS,
//           BANKX_ABI,
//           signer
//         );

//       setWithdrawing(true);
//       clearMessage();

//       /*
//        * Send withdrawal transaction
//        */

//       const tx =
//         await contract.withdraw(
//           amount
//         );

//       console.log(
//         "Withdrawal transaction:",
//         tx.hash
//       );

//       showMessage(
//         "Withdrawal submitted. Waiting for confirmation...",
//         "success"
//       );

//       await tx.wait();

//       setWithdrawAmount("");

//       /*
//        * Refresh wallet balance
//        */

//       await updateWalletInfo(
//         provider,
//         walletAddress
//       );

//       /*
//        * Refresh contract balance
//        */

//       await loadSavingsData(
//         provider,
//         walletAddress
//       );

//       showMessage(
//         "Withdrawal successful!",
//         "success"
//       );

//     } catch (error) {
//       console.error(
//         "Withdrawal failed:",
//         error
//       );

//       showMessage(
//         getErrorMessage(error),
//         "error"
//       );

//     } finally {
//       setWithdrawing(false);
//     }
//   };

//   /* =====================================================
//      REFRESH
//   ===================================================== */

//   const refreshSavings = async () => {
//     if (
//       !getWalletProvider() ||
//       !walletAddress
//     ) {
//       return;
//     }

//     try {
//       const provider =
//         new ethers.BrowserProvider(
//           getWalletProvider()
//         );

//       await updateWalletInfo(
//         provider,
//         walletAddress
//       );

//       await loadSavingsData(
//         provider,
//         walletAddress
//       );

//       showMessage(
//         "Savings data refreshed.",
//         "success"
//       );

//     } catch (error) {
//       console.error(
//         "Refresh failed:",
//         error
//       );

//       showMessage(
//         getErrorMessage(error),
//         "error"
//       );
//     }
//   };

//   /* =====================================================
//      CHECK EXISTING WALLET
//   ===================================================== */

//   useEffect(() => {
//     const checkWallet =
//       async () => {
//         if (!getWalletProvider()) {
//           return;
//         }

//         try {
//           const provider =
//             new ethers.BrowserProvider(
//               getWalletProvider()
//             );

//           const accounts =
//             await provider.send(
//               "eth_accounts",
//               []
//             );

//           if (
//             !accounts ||
//             accounts.length === 0
//           ) {
//             return;
//           }

//           const address =
//             accounts[0];

//           setWalletAddress(address);

//           await updateWalletInfo(
//             provider,
//             address
//           );

//           await loadSavingsData(
//             provider,
//             address
//           );

//         } catch (error) {
//           console.error(
//             "Wallet check failed:",
//             error
//           );
//         }
//       };

//     checkWallet();
//   }, []);

//   /* =====================================================
//      WALLET EVENTS
//   ===================================================== */

//   useEffect(() => {
//     if (!getWalletProvider()) {
//       return;
//     }

//     const handleAccountsChanged =
//       async (accounts) => {
//         try {
//           if (
//             !accounts ||
//             accounts.length === 0
//           ) {
//             setWalletAddress("");
//             setEthBalance("0");
//             setNetworkName("");

//             setSavingsData({
//               totalSavings: "0",
//               availableBalance: "0",
//               loanBalance: "0",
//               poolBalance: "0",
//               positions: [],
//             });

//             return;
//           }

//           const address =
//             accounts[0];

//           setWalletAddress(address);

//           const provider =
//             new ethers.BrowserProvider(
//               getWalletProvider()
//             );

//           await updateWalletInfo(
//             provider,
//             address
//           );

//           await loadSavingsData(
//             provider,
//             address
//           );

//         } catch (error) {
//           console.error(
//             "Account change error:",
//             error
//           );
//         }
//       };

//     const handleChainChanged =
//       () => {
//         window.location.reload();
//       };

//     getWalletProvider().on(
//       "accountsChanged",
//       handleAccountsChanged
//     );

//     getWalletProvider().on(
//       "chainChanged",
//       handleChainChanged
//     );

//     return () => {
//       getWalletProvider().removeListener(
//         "accountsChanged",
//         handleAccountsChanged
//       );

//       getWalletProvider().removeListener(
//         "chainChanged",
//         handleChainChanged
//       );
//     };
//   }, []);

//   /* =====================================================
//      MESSAGE HELPERS
//   ===================================================== */

//   const showMessage = (
//     text,
//     type
//   ) => {
//     setMessage(text);
//     setMessageType(type);

//     setTimeout(() => {
//       setMessage("");
//       setMessageType("");
//     }, 5000);
//   };

//   const clearMessage = () => {
//     setMessage("");
//     setMessageType("");
//   };

//   /* =====================================================
//      WALLET FORMAT
//   ===================================================== */

//   const shortAddress =
//     walletAddress
//       ? `${walletAddress.slice(
//           0,
//           6
//         )}...${walletAddress.slice(-4)}`
//       : "";

//   /* =====================================================
//      MAX DEPOSIT
//   ===================================================== */

//   const setMaxDeposit = () => {
//     const balance =
//       Number(ethBalance);

//     /*
//      * Keep 0.001 ETH for gas.
//      */

//     const max =
//       Math.max(
//         balance - 0.001,
//         0
//       );

//     setDepositAmount(
//       max.toFixed(6)
//     );
//   };

//   /* =====================================================
//      MAX WITHDRAW
//   ===================================================== */

//   const setMaxWithdraw = () => {
//     setWithdrawAmount(
//       savingsData.totalSavings
//     );
//   };

//   /* =====================================================
//      PAGE
//   ===================================================== */

//   return (
//     <div className="h-screen overflow-hidden bg-[#f6f7fb] text-[#202238]">

//       {/* MOBILE OVERLAY */}

//       {mobileMenu && (
//         <div
//           className="fixed inset-0 z-40 bg-black/30 lg:hidden"
//           onClick={() =>
//             setMobileMenu(false)
//           }
//         />
//       )}

//       {/* =================================================
//           SIDEBAR
//       ================================================= */}

//       <aside
//         className={`
//           fixed left-0 top-0 z-50
//           flex h-screen w-[235px]
//           flex-col bg-[#211d4f] text-white
//           transition-transform duration-300
//           lg:translate-x-0
//           ${
//             mobileMenu
//               ? "translate-x-0"
//               : "-translate-x-full"
//           }
//         `}
//       >

//         {/* LOGO */}

//         <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-5">

//           <div className="flex items-center gap-3">

//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b6cff] to-[#635bff]">
//               <Network size={20} />
//             </div>

//             <div>

//               <h1 className="text-xl font-extrabold">
//                 Bank
//                 <span className="text-[#9c8cff]">
//                   X
//                 </span>
//               </h1>

//               <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
//                 DeFi Finance
//               </p>

//             </div>

//           </div>

//           <button
//             className="ml-auto lg:hidden"
//             onClick={() =>
//               setMobileMenu(false)
//             }
//           >
//             <X size={20} />
//           </button>

//         </div>

//         {/* NAVIGATION */}

//         <div className="px-3 pt-6">

//           <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">
//             Main Menu
//           </p>

//           <NavItem
//             icon={LayoutDashboard}
//             label="Dashboard"
//             path="/dashboard"
//             navigate={navigate}
//           />

//           <NavItem
//             icon={CircleDollarSign}
//             label="Savings"
//             path="/savings"
//             active
//             navigate={navigate}
//           />

//           <NavItem
//             icon={Landmark}
//             label="Borrow"
//             path="/loans"
//             navigate={navigate}
//           />

//           <NavItem
//             icon={BarChart3}
//             label="Markets"
//             path="/markets"
//             navigate={navigate}
//           />

//           <NavItem
//             icon={Gem}
//             label="Vaults"
//             path="/vaults"
//             navigate={navigate}
//           />

//           <NavItem
//             icon={CreditCard}
//             label="Transactions"
//             path="/transactions"
//             navigate={navigate}
//           />

//           <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">
//             Account
//           </p>

//           <NavItem
//             icon={Wallet}
//             label="Wallet"
//             path="/wallet"
//             navigate={navigate}
//           />

//           <NavItem
//             icon={ShieldCheck}
//             label="Security"
//             path="/security"
//             navigate={navigate}
//           />

//           <NavItem
//             icon={Settings}
//             label="Settings"
//             path="/settings"
//             navigate={navigate}
//           />

//         </div>

//         {/* PROMO */}

//         <div className="mt-auto p-3">

//           <div className="rounded-2xl bg-gradient-to-br from-[#6959e8] to-[#4d46b9] p-4">

//             <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
//               <Sparkles size={17} />
//             </div>

//             <p className="text-sm font-bold">
//               Earn with BankX
//             </p>

//             <p className="mt-1 text-[11px] leading-4 text-white/60">
//               Put your assets to work.
//             </p>

//             <button
//               onClick={() =>
//                 navigate("/vaults")
//               }
//               className="mt-3 w-full rounded-lg bg-white py-2 text-[11px] font-bold text-[#5549c8]"
//             >
//               Explore Vaults
//             </button>

//           </div>

//         </div>

//       </aside>

//       {/* =================================================
//           MAIN
//       ================================================= */}

//       <main className="h-screen overflow-hidden lg:ml-[235px]">

//         {/* =================================================
//             TOP NAVBAR
//         ================================================= */}

//         <header className="h-[76px] shrink-0 border-b border-[#e9e9f0] bg-white px-5 sm:px-8">

//           <div className="flex h-full items-center justify-between">

//             <div className="flex items-center gap-4">

//               <button
//                 className="rounded-lg bg-[#f4f4fa] p-2.5 lg:hidden"
//                 onClick={() =>
//                   setMobileMenu(true)
//                 }
//               >
//                 <Menu size={20} />
//               </button>

//               <div>

//                 <h2 className="text-lg font-bold">
//                   Savings
//                 </h2>

//                 <p className="text-[11px] text-gray-400">
//                   Manage your BankX decentralized savings
//                 </p>

//               </div>

//             </div>

//             <div className="flex items-center gap-3">

//               {walletAddress && (
//                 <div className="hidden items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 sm:flex">

//                   <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

//                   <span className="text-[11px] font-semibold text-gray-500">
//                     {networkName}
//                   </span>

//                 </div>
//               )}

//               <button className="relative rounded-lg border border-gray-100 bg-white p-2.5">
//                 <Bell
//                   size={18}
//                   className="text-gray-500"
//                 />
//               </button>

//               {!walletAddress ? (

//                 <button
//                   onClick={connectWallet}
//                   disabled={connecting}
//                   className="flex items-center gap-2 rounded-lg bg-[#6558d9] px-5 py-2.5 text-[11px] font-bold text-white shadow-md shadow-indigo-100 disabled:opacity-60"
//                 >

//                   <Wallet size={16} />

//                   {connecting
//                     ? "Connecting..."
//                     : "Connect Wallet"}

//                 </button>

//               ) : (

//                 <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-2">

//                   <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

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

//         {/* =================================================
//             CONTENT
//         ================================================= */}

//         <div className="h-[calc(100vh-76px)] overflow-y-auto p-5 sm:p-7">

//           <div className="mx-auto max-w-[1500px]">

//             {/* HEADER */}

//             <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

//               <div>

//                 <p className="text-[12px] font-medium text-gray-400">
//                   Your savings
//                 </p>

//                 <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
//                   Save & manage
//                 </h1>

//                 <p className="mt-2 text-[12px] text-gray-400">
//                   Deposit and withdraw ETH directly through the BankX smart contract.
//                 </p>

//               </div>

//               {walletAddress && (

//                 <button
//                   onClick={refreshSavings}
//                   disabled={loading}
//                   className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 sm:self-auto"
//                 >

//                   <RefreshCw
//                     size={14}
//                     className={
//                       loading
//                         ? "animate-spin"
//                         : ""
//                     }
//                   />

//                   Refresh

//                 </button>

//               )}

//             </div>

//             {/* =================================================
//                 MESSAGE
//             ================================================= */}

//             {message && (

//               <div
//                 className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
//                   messageType === "error"
//                     ? "border-red-100 bg-red-50 text-red-600"
//                     : "border-emerald-100 bg-emerald-50 text-emerald-600"
//                 }`}
//               >

//                 {messageType === "error" ? (
//                   <AlertCircle size={18} />
//                 ) : (
//                   <CheckCircle2 size={18} />
//                 )}

//                 <p className="text-[11px] font-semibold">
//                   {message}
//                 </p>

//               </div>

//             )}

//             {/* =================================================
//                 STAT CARDS
//             ================================================= */}

//             <div className="grid gap-5 md:grid-cols-3">

//               <SavingsCard
//                 icon={CircleDollarSign}
//                 title="Total Savings"
//                 value={
//                   walletAddress
//                     ? `${savingsData.totalSavings} ETH`
//                     : "—"
//                 }
//                 description={
//                   walletAddress
//                     ? "Your BankX savings"
//                     : "Connect your wallet"
//                 }
//                 loading={loading}
//               />

//               <SavingsCard
//                 icon={Wallet}
//                 title="Wallet Balance"
//                 value={
//                   walletAddress
//                     ? `${ethBalance} ETH`
//                     : "—"
//                 }
//                 description="Available in your wallet"
//                 loading={false}
//               />

//               <SavingsCard
//                 icon={Landmark}
//                 title="Active Loan"
//                 value={
//                   walletAddress
//                     ? `${savingsData.loanBalance} ETH`
//                     : "—"
//                 }
//                 description="Current BankX loan"
//                 loading={loading}
//               />

//             </div>

//             {/* =================================================
//                 DEPOSIT + WITHDRAW
//             ================================================= */}

//             <div className="mt-6 grid gap-5 lg:grid-cols-2">

//               {/* DEPOSIT */}

//               <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

//                 <div className="flex items-center gap-3">

//                   <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
//                     <ArrowDownLeft size={21} />
//                   </div>

//                   <div>

//                     <h3 className="text-lg font-extrabold">
//                       Deposit ETH
//                     </h3>

//                     <p className="mt-1 text-[11px] text-gray-400">
//                       Add ETH to your BankX savings
//                     </p>

//                   </div>

//                 </div>

//                 {!walletAddress ? (

//                   <WalletRequired
//                     connectWallet={connectWallet}
//                     connecting={connecting}
//                   />

//                 ) : (

//                   <div className="mt-6">

//                     <div className="mb-2 flex items-center justify-between">

//                       <label className="text-[11px] font-bold text-gray-600">
//                         Amount
//                       </label>

//                       <button
//                         onClick={setMaxDeposit}
//                         className="text-[10px] font-bold text-violet-600 hover:text-violet-800"
//                       >
//                         MAX
//                       </button>

//                     </div>

//                     <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-1 focus-within:border-violet-400">

//                       <input
//                         type="number"
//                         min="0"
//                         step="0.0001"
//                         placeholder="0.00"
//                         value={depositAmount}
//                         onChange={(e) =>
//                           setDepositAmount(
//                             e.target.value
//                           )
//                         }
//                         className="w-full bg-transparent py-3 text-lg font-bold outline-none"
//                       />

//                       <span className="rounded-lg bg-white px-3 py-2 text-[11px] font-extrabold text-gray-600 shadow-sm">
//                         ETH
//                       </span>

//                     </div>

//                     <div className="mt-3 flex justify-between">

//                       <span className="text-[10px] text-gray-400">
//                         Wallet balance
//                       </span>

//                       <span className="text-[10px] font-bold text-gray-600">
//                         {ethBalance} ETH
//                       </span>

//                     </div>

//                     <button
//                       onClick={handleDeposit}
//                       disabled={
//                         depositing ||
//                         !depositAmount
//                       }
//                       className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6558d9] py-3.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac8] disabled:cursor-not-allowed disabled:opacity-50"
//                     >

//                       <ArrowDownLeft size={16} />

//                       {depositing
//                         ? "Depositing..."
//                         : "Deposit ETH"}

//                     </button>

//                     <p className="mt-3 text-center text-[10px] text-gray-400">
//                       MetaMask will ask you to confirm this transaction.
//                     </p>

//                   </div>

//                 )}

//               </div>

//               {/* WITHDRAW */}

//               <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

//                 <div className="flex items-center gap-3">

//                   <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
//                     <ArrowUpRight size={21} />
//                   </div>

//                   <div>

//                     <h3 className="text-lg font-extrabold">
//                       Withdraw ETH
//                     </h3>

//                     <p className="mt-1 text-[11px] text-gray-400">
//                       Move your savings back to your wallet
//                     </p>

//                   </div>

//                 </div>

//                 {!walletAddress ? (

//                   <WalletRequired
//                     connectWallet={connectWallet}
//                     connecting={connecting}
//                   />

//                 ) : (

//                   <div className="mt-6">

//                     <div className="mb-2 flex items-center justify-between">

//                       <label className="text-[11px] font-bold text-gray-600">
//                         Amount
//                       </label>

//                       <button
//                         onClick={setMaxWithdraw}
//                         className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
//                       >
//                         MAX
//                       </button>

//                     </div>

//                     <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-1 focus-within:border-emerald-400">

//                       <input
//                         type="number"
//                         min="0"
//                         step="0.0001"
//                         placeholder="0.00"
//                         value={withdrawAmount}
//                         onChange={(e) =>
//                           setWithdrawAmount(
//                             e.target.value
//                           )
//                         }
//                         className="w-full bg-transparent py-3 text-lg font-bold outline-none"
//                       />

//                       <span className="rounded-lg bg-white px-3 py-2 text-[11px] font-extrabold text-gray-600 shadow-sm">
//                         ETH
//                       </span>

//                     </div>

//                     <div className="mt-3 flex justify-between">

//                       <span className="text-[10px] text-gray-400">
//                         Savings balance
//                       </span>

//                       <span className="text-[10px] font-bold text-gray-600">
//                         {savingsData.totalSavings} ETH
//                       </span>

//                     </div>

//                     <button
//                       onClick={handleWithdraw}
//                       disabled={
//                         withdrawing ||
//                         !withdrawAmount ||
//                         Number(
//                           withdrawAmount
//                         ) >
//                           Number(
//                             savingsData.totalSavings
//                           )
//                       }
//                       className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#15966d] py-3.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-[#11845f] disabled:cursor-not-allowed disabled:opacity-50"
//                     >

//                       <ArrowUpRight size={16} />

//                       {withdrawing
//                         ? "Withdrawing..."
//                         : "Withdraw ETH"}

//                     </button>

//                     <p className="mt-3 text-center text-[10px] text-gray-400">
//                       Withdrawal is limited to your BankX savings balance.
//                     </p>

//                   </div>

//                 )}

//               </div>

//             </div>

//             {/* =================================================
//                 BALANCE OVERVIEW
//             ================================================= */}

//             <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">

//               {/* SAVINGS POSITION */}

//               <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

//                 <div className="flex items-center justify-between">

//                   <div className="flex items-center gap-3">

//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
//                       <LockKeyhole size={19} />
//                     </div>

//                     <div>

//                       <h3 className="text-lg font-extrabold">
//                         Your savings position
//                       </h3>

//                       <p className="text-[11px] text-gray-400">
//                         Live balance from BankX smart contract
//                       </p>

//                     </div>

//                   </div>

//                   {walletAddress && (
//                     <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-bold text-emerald-600 sm:block">
//                       On-chain
//                     </span>
//                   )}

//                 </div>

//                 <div className="mt-6 rounded-xl bg-[#fafafe] p-6">

//                   <div className="flex items-center justify-between">

//                     <div>

//                       <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//                         BankX Savings
//                       </p>

//                       <p className="mt-2 text-3xl font-extrabold">
//                         {walletAddress
//                           ? `${savingsData.totalSavings} ETH`
//                           : "—"}
//                       </p>

//                     </div>

//                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-xl font-extrabold text-violet-600">
//                       Ξ
//                     </div>

//                   </div>

//                   <div className="mt-5 h-px bg-gray-200" />

//                   <div className="mt-5 grid grid-cols-2 gap-5">

//                     <div>

//                       <p className="text-[10px] text-gray-400">
//                         Pool Balance
//                       </p>

//                       <p className="mt-1 text-sm font-bold">
//                         {walletAddress
//                           ? `${savingsData.poolBalance} ETH`
//                           : "—"}
//                       </p>

//                     </div>

//                     <div>

//                       <p className="text-[10px] text-gray-400">
//                         Active Loan
//                       </p>

//                       <p className="mt-1 text-sm font-bold">
//                         {walletAddress
//                           ? `${savingsData.loanBalance} ETH`
//                           : "—"}
//                       </p>

//                     </div>

//                   </div>

//                 </div>

//               </div>

//               {/* HOW IT WORKS */}

//               <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

//                 <div className="flex items-center gap-3">

//                   <Info
//                     size={20}
//                     className="text-violet-500"
//                   />

//                   <h3 className="text-base font-extrabold">
//                     How savings works
//                   </h3>

//                 </div>

//                 <div className="mt-6 space-y-6">

//                   <Step
//                     number="01"
//                     title="Connect wallet"
//                     text="Connect a wallet to access your BankX account."
//                   />

//                   <Step
//                     number="02"
//                     title="Deposit ETH"
//                     text="Send ETH to the BankX smart contract and your savings balance increases."
//                   />

//                   <Step
//                     number="03"
//                     title="Track savings"
//                     text="Your savings balance is read directly from the blockchain."
//                   />

//                   <Step
//                     number="04"
//                     title="Withdraw"
//                     text="Withdraw any amount up to your available BankX savings balance."
//                   />

//                 </div>

//               </div>

//             </div>

//             {/* =================================================
//                 CONTRACT STATUS
//             ================================================= */}

//             <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6">

//               <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

//                 <div className="flex items-center gap-4">

//                   <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                     <Network size={21} />
//                   </div>

//                   <div>

//                     <p className="text-[11px] font-semibold text-gray-400">
//                       BankX Savings Contract
//                     </p>

//                     <h3 className="mt-1 text-base font-extrabold">
//                       Connected & Active
//                     </h3>

//                     <p className="mt-1 break-all text-[10px] text-gray-400">
//                       {CONTRACT_ADDRESS}
//                     </p>

//                   </div>

//                 </div>

//                 <div className="rounded-xl bg-emerald-50 px-4 py-3">

//                   <p className="text-[10px] font-bold text-emerald-600">
//                     Live blockchain mode
//                   </p>

//                   <p className="mt-1 text-[9px] text-emerald-500">
//                     Deposits and withdrawals enabled
//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>

//       </main>

//     </div>
//   );
// }

// /* =====================================================
//    NAV ITEM
// ===================================================== */

// function NavItem({
//   icon: Icon,
//   label,
//   path,
//   active,
//   navigate,
// }) {
//   return (
//     <button
//       onClick={() =>
//         navigate(path)
//       }
//       className={`
//         mb-1 flex w-full items-center gap-3
//         rounded-lg px-3 py-3
//         text-[12px] font-semibold transition
//         ${
//           active
//             ? "bg-[#6255d5] text-white shadow-lg shadow-indigo-950/20"
//             : "text-white/50 hover:bg-white/5 hover:text-white"
//         }
//       `}
//     >
//       <Icon size={17} />
//       {label}
//     </button>
//   );
// }

// /* =====================================================
//    SAVINGS CARD
// ===================================================== */

// function SavingsCard({
//   icon: Icon,
//   title,
//   value,
//   description,
//   loading,
// }) {
//   return (
//     <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm">

//       <div className="flex items-start justify-between">

//         <div>

//           <p className="text-[11px] font-semibold text-gray-400">
//             {title}
//           </p>

//           {loading ? (

//             <div className="mt-3 h-8 w-28 animate-pulse rounded bg-gray-100" />

//           ) : (

//             <h3 className="mt-2 text-2xl font-extrabold">
//               {value}
//             </h3>

//           )}

//           <p className="mt-1 text-[10px] text-gray-400">
//             {description}
//           </p>

//         </div>

//         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
//           <Icon size={20} />
//         </div>

//       </div>

//     </div>
//   );
// }

// /* =====================================================
//    WALLET REQUIRED
// ===================================================== */

// function WalletRequired({
//   connectWallet,
//   connecting,
// }) {
//   return (
//     <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-9 text-center">

//       <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
//         <Wallet size={28} />
//       </div>

//       <p className="mt-4 text-base font-bold text-gray-400">
//         Wallet connection required
//       </p>

//       <p className="mx-auto mt-1 max-w-md text-[11px] leading-5 text-gray-300">
//         Connect your wallet to access BankX savings.
//       </p>

//       <button
//         onClick={connectWallet}
//         disabled={connecting}
//         className="mt-5 rounded-xl bg-[#6558d9] px-7 py-3 text-[11px] font-bold text-white disabled:opacity-60"
//       >
//         {connecting
//           ? "Connecting..."
//           : "Connect Wallet"}
//       </button>

//     </div>
//   );
// }

// /* =====================================================
//    STEP
// ===================================================== */

// function Step({
//   number,
//   title,
//   text,
// }) {
//   return (
//     <div className="flex gap-3">

//       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[10px] font-extrabold text-violet-600">
//         {number}
//       </div>

//       <div>

//         <p className="text-[12px] font-bold">
//           {title}
//         </p>

//         <p className="mt-1 text-[10px] leading-5 text-gray-400">
//           {text}
//         </p>

//       </div>

//     </div>
//   );
// }

// /* =====================================================
//    ERROR MESSAGE
// ===================================================== */

// function getErrorMessage(error) {
//   if (!error) {
//     return "Transaction failed.";
//   }

//   if (
//     error.code ===
//     "ACTION_REJECTED"
//   ) {
//     return "Transaction rejected in MetaMask.";
//   }

//   if (
//     error.code === 4001
//   ) {
//     return "Transaction rejected in MetaMask.";
//   }

//   if (
//     error.code ===
//     "INSUFFICIENT_FUNDS"
//   ) {
//     return "Insufficient ETH. Keep some ETH for gas fees.";
//   }

//   if (
//     error.reason
//   ) {
//     return error.reason;
//   }

//   if (
//     error.shortMessage
//   ) {
//     return error.shortMessage;
//   }

//   if (
//     error.message
//   ) {
//     if (
//       error.message.includes(
//         "insufficient funds"
//       )
//     ) {
//       return "Insufficient ETH. Keep some ETH for gas fees.";
//     }

//     if (
//       error.message.includes(
//         "user rejected"
//       )
//     ) {
//       return "Transaction rejected in MetaMask.";
//     }

//     return error.message;
//   }

//   return "Transaction failed.";
// }

// /* =====================================================
//    NETWORK NAME
// ===================================================== */

// function getNetworkName(chainId) {
//   const id =
//     chainId.toString();

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

//   return (
//     networks[id] ||
//     `Chain ${id}`
//   );
// }


import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  CircleDollarSign,
  CreditCard,
  Gem,
  LayoutDashboard,
  Landmark,
  Menu,
  Network,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  LockKeyhole,
  Info,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { getLegacyBankXAddress } from "../config/contract";

async function resolveLegacyAddress(provider) {
  const chainId = (await provider.getNetwork()).chainId;
  const address = getLegacyBankXAddress(chainId);
  if (!address || !ethers.isAddress(address)) {
    throw new Error(`BankX is not configured for chain ${chainId.toString()}.`);
  }
  if ((await provider.getCode(address)) === "0x") {
    throw new Error("No legacy BankX contract code exists at the configured address.");
  }
  return address;
}

/* =====================================================
   BANKX CONTRACT
===================================================== */

const BANKX_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  /* Direct savings mapping */
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "savings",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  /* Direct loans mapping */
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "loans",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "totalPool",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "requestLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    name: "repayLoan",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  {
    inputs: [],
    name: "getSavings",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "getLoan",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "getPoolBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  /* EVENTS */

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LoanRequested",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LoanRepaid",
    type: "event",
  },
];

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function Savings() {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [legacyContractAddress, setLegacyContractAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [networkName, setNetworkName] = useState("");

  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [savingsData, setSavingsData] = useState({
    totalSavings: "0.0000",
    availableBalance: "0.0000",
    loanBalance: "0.0000",
    poolBalance: "0.0000",
  });

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatETH = (value) => {
    try {
      return Number(
        ethers.formatEther(value)
      ).toFixed(4);
    } catch {
      return "0.0000";
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  /* =====================================================
     UPDATE WALLET INFO
  ===================================================== */

  const updateWalletInfo = useCallback(
    async (provider, address) => {
      if (!provider || !address) return;

      try {
        const balance =
          await provider.getBalance(address);

        const formattedBalance =
          Number(
            ethers.formatEther(balance)
          ).toFixed(4);

        setEthBalance(formattedBalance);

        const network =
          await provider.getNetwork();

        setNetworkName(
          getNetworkName(network.chainId)
        );
      } catch (error) {
        console.error(
          "Wallet information error:",
          error
        );
      }
    },
    []
  );

  /* =====================================================
     LOAD SAVINGS DATA
  ===================================================== */

  const loadSavingsData = useCallback(
    async (provider, address) => {
      if (!provider || !address) return;

      try {
        setLoading(true);

        const contractAddress = await resolveLegacyAddress(provider);
        setLegacyContractAddress(contractAddress);

        const contract =
          new ethers.Contract(
            contractAddress,
            BANKX_ABI,
            provider
          );

        /*
         * IMPORTANT:
         *
         * Read the mapping directly using
         * the connected wallet address.
         *
         * This is more reliable than:
         *
         * contract.getSavings({ from: address })
         */

        const savings =
          await contract.savings(address);

        const loan =
          await contract.loans(address);

        /*
         * Pool balance.
         *
         * First try getPoolBalance().
         */

        let pool = 0n;

        try {
          pool =
            await contract.getPoolBalance();
        } catch {
          /*
           * Fallback to actual contract ETH balance.
           */
          pool =
            await provider.getBalance(
              contractAddress
            );
        }

        const savingsFormatted =
          formatETH(savings);

        const loanFormatted =
          formatETH(loan);

        const poolFormatted =
          formatETH(pool);

        console.log(
          "========== BANKX DATA =========="
        );

        console.log(
          "Wallet:",
          address
        );

        console.log(
          "Savings:",
          savingsFormatted,
          "ETH"
        );

        console.log(
          "Loan:",
          loanFormatted,
          "ETH"
        );

        console.log(
          "Pool:",
          poolFormatted,
          "ETH"
        );

        console.log(
          "================================"
        );

        setSavingsData({
          totalSavings:
            savingsFormatted,

          availableBalance:
            savingsFormatted,

          loanBalance:
            loanFormatted,

          poolBalance:
            poolFormatted,
        });
      } catch (error) {
        console.error(
          "Failed to load BankX data:",
          error
        );

        showMessage(
          "Unable to read savings from the BankX contract.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =====================================================
     LOAD EVERYTHING
  ===================================================== */

  const loadAllData = useCallback(
    async (address) => {
      if (!getWalletProvider() || !address) {
        return;
      }

      try {
        const provider =
          new ethers.BrowserProvider(
            getWalletProvider()
          );

        await updateWalletInfo(
          provider,
          address
        );

        await loadSavingsData(
          provider,
          address
        );
      } catch (error) {
        console.error(
          "Failed to load data:",
          error
        );
      }
    },
    [
      updateWalletInfo,
      loadSavingsData,
    ]
  );

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
      clearMessage();

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      const contractAddress = await resolveLegacyAddress(provider);
      setLegacyContractAddress(contractAddress);

      const accounts =
        await provider.send(
          "eth_requestAccounts",
          []
        );

      if (
        !accounts ||
        accounts.length === 0
      ) {
        return;
      }

      const address = accounts[0];

      setWalletAddress(address);

      await loadAllData(address);
    } catch (error) {
      console.error(
        "Wallet connection failed:",
        error
      );

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setConnecting(false);
    }
  };

  /* =====================================================
     DEPOSIT
  ===================================================== */

  const handleDeposit = async () => {
    try {
      if (!getWalletProvider()) {
        alert(
          "No browser wallet is available. Connect with WalletConnect or install a wallet extension."
        );
        return;
      }

      if (!walletAddress) {
        showMessage(
          "Connect your wallet first.",
          "error"
        );
        return;
      }

      const input =
        depositAmount.trim();

      if (!input) {
        showMessage(
          "Enter an amount to deposit.",
          "error"
        );
        return;
      }

      if (
        !Number.isFinite(
          Number(input)
        ) ||
        Number(input) <= 0
      ) {
        showMessage(
          "Enter a valid ETH amount.",
          "error"
        );
        return;
      }

      let amount;

      try {
        amount =
          ethers.parseEther(input);
      } catch {
        showMessage(
          "Invalid ETH amount. Example: 0.01",
          "error"
        );
        return;
      }

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      const contractAddress = await resolveLegacyAddress(provider);
      setLegacyContractAddress(contractAddress);

      const signer =
        await provider.getSigner();

      const signerAddress =
        await signer.getAddress();

      const balance =
        await provider.getBalance(
          signerAddress
        );

      /*
       * Leave some ETH for gas.
       */

      if (amount >= balance) {
        showMessage(
          "You need to keep some ETH for gas fees.",
          "error"
        );
        return;
      }

      setDepositing(true);
      clearMessage();

      const contract =
        new ethers.Contract(
          contractAddress,
          BANKX_ABI,
          signer
        );

      const tx =
        await contract.deposit({
          value: amount,
        });

      console.log(
        "Deposit TX:",
        tx.hash
      );

      showMessage(
        "Deposit submitted. Waiting for confirmation...",
        "success"
      );

      await tx.wait();

      setDepositAmount("");

      /*
       * IMPORTANT:
       * Reload blockchain data AFTER tx confirmation.
       */

      await loadAllData(
        signerAddress
      );

      showMessage(
        "Deposit successful!",
        "success"
      );
    } catch (error) {
      console.error(
        "Deposit failed:",
        error
      );

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setDepositing(false);
    }
  };

  /* =====================================================
     WITHDRAW
  ===================================================== */

  const handleWithdraw = async () => {
    try {
      if (!getWalletProvider()) {
        alert(
          "No browser wallet is available. Connect with WalletConnect or install a wallet extension."
        );
        return;
      }

      if (!walletAddress) {
        showMessage(
          "Connect your wallet first.",
          "error"
        );
        return;
      }

      const input =
        withdrawAmount.trim();

      if (!input) {
        showMessage(
          "Enter an amount to withdraw.",
          "error"
        );
        return;
      }

      if (
        !Number.isFinite(
          Number(input)
        ) ||
        Number(input) <= 0
      ) {
        showMessage(
          "Enter a valid ETH amount.",
          "error"
        );
        return;
      }

      let amount;

      try {
        amount =
          ethers.parseEther(input);
      } catch {
        showMessage(
          "Invalid ETH amount.",
          "error"
        );
        return;
      }

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      const contractAddress = await resolveLegacyAddress(provider);
      setLegacyContractAddress(contractAddress);

      /*
       * Read savings directly from mapping.
       */

      const readContract =
        new ethers.Contract(
          contractAddress,
          BANKX_ABI,
          provider
        );

      const saved =
        await readContract.savings(
          walletAddress
        );

      console.log(
        "Savings before withdrawal:",
        ethers.formatEther(saved)
      );

      if (amount > saved) {
        showMessage(
          "Withdrawal exceeds your savings balance.",
          "error"
        );
        return;
      }

      const signer =
        await provider.getSigner();

      const signerAddress =
        await signer.getAddress();

      const contract =
        new ethers.Contract(
          contractAddress,
          BANKX_ABI,
          signer
        );

      setWithdrawing(true);
      clearMessage();

      const tx =
        await contract.withdraw(
          amount
        );

      console.log(
        "Withdrawal TX:",
        tx.hash
      );

      showMessage(
        "Withdrawal submitted. Waiting for confirmation...",
        "success"
      );

      await tx.wait();

      setWithdrawAmount("");

      /*
       * Reload BOTH wallet balance
       * and BankX savings balance.
       */

      await loadAllData(
        signerAddress
      );

      showMessage(
        "Withdrawal successful!",
        "success"
      );
    } catch (error) {
      console.error(
        "Withdrawal failed:",
        error
      );

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  /* =====================================================
     REFRESH
  ===================================================== */

  const refreshSavings = async () => {
    if (!walletAddress) {
      return;
    }

    try {
      setLoading(true);

      await loadAllData(
        walletAddress
      );

      showMessage(
        "Savings data refreshed.",
        "success"
      );
    } catch (error) {
      console.error(
        "Refresh failed:",
        error
      );

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     MAX DEPOSIT
  ===================================================== */

  const setMaxDeposit = () => {
    const balance =
      Number(ethBalance);

    /*
     * Keep 0.001 ETH for gas.
     */

    const max =
      Math.max(
        balance - 0.001,
        0
      );

    setDepositAmount(
      max.toFixed(4)
    );
  };

  /* =====================================================
     MAX WITHDRAW
  ===================================================== */

  const setMaxWithdraw = () => {
    setWithdrawAmount(
      savingsData.totalSavings
    );
  };

  /* =====================================================
     INITIAL WALLET CHECK
  ===================================================== */

  useEffect(() => {
    const checkWallet =
      async () => {
        if (!getWalletProvider()) {
          return;
        }

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

          if (
            !accounts ||
            accounts.length === 0
          ) {
            return;
          }

          const address =
            accounts[0];

          setWalletAddress(address);

          await loadAllData(address);
        } catch (error) {
          console.error(
            "Wallet check failed:",
            error
          );
        }
      };

    checkWallet();
  }, [loadAllData]);

  /* =====================================================
     WALLET EVENTS
  ===================================================== */

  useEffect(() => {
    if (!getWalletProvider()) {
      return;
    }

    const handleAccountsChanged =
      async (accounts) => {
        try {
          if (
            !accounts ||
            accounts.length === 0
          ) {
            setWalletAddress("");
            setEthBalance("0.0000");
            setNetworkName("");

            setSavingsData({
              totalSavings: "0.0000",
              availableBalance: "0.0000",
              loanBalance: "0.0000",
              poolBalance: "0.0000",
            });

            return;
          }

          const address =
            accounts[0];

          setWalletAddress(address);

          await loadAllData(address);
        } catch (error) {
          console.error(
            "Account change error:",
            error
          );
        }
      };

    const handleChainChanged =
      () => {
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
  }, [loadAllData]);

  /* =====================================================
     FORMATTING
  ===================================================== */

  const shortAddress =
    walletAddress
      ? `${walletAddress.slice(
          0,
          6
        )}...${walletAddress.slice(-4)}`
      : "";

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb] text-[#202238]">

      {/* MOBILE OVERLAY */}

      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() =>
            setMobileMenu(false)
          }
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[235px]
          flex-col bg-[#211d4f] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileMenu
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* LOGO */}

        <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b6cff] to-[#635bff]">
              <Network size={20} />
            </div>

            <div>

              <h1 className="text-xl font-extrabold">
                Bank
                <span className="text-[#9c8cff]">
                  X
                </span>
              </h1>

              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                DeFi Finance
              </p>

            </div>

          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <X size={20} />
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="px-3 pt-6">

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">
            Main Menu
          </p>

          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            path="/dashboard"
            navigate={navigate}
          />

          <NavItem
            icon={CircleDollarSign}
            label="Savings"
            path="/savings"
            active
            navigate={navigate}
          />

          <NavItem
            icon={Landmark}
            label="Borrow"
            path="/loans"
            navigate={navigate}
          />

          <NavItem
            icon={BarChart3}
            label="Markets"
            path="/markets"
            navigate={navigate}
          />

          <NavItem
            icon={Gem}
            label="Vaults"
            path="/vaults"
            navigate={navigate}
          />

          <NavItem
            icon={CreditCard}
            label="Transactions"
            path="/transactions"
            navigate={navigate}
          />

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">
            Account
          </p>

          <NavItem
            icon={Wallet}
            label="Wallet"
            path="/wallet"
            navigate={navigate}
          />

          <NavItem
            icon={ShieldCheck}
            label="Security"
            path="/security"
            navigate={navigate}
          />

          <NavItem
            icon={Settings}
            label="Settings"
            path="/settings"
            navigate={navigate}
          />

        </div>

        {/* PROMO */}

        <div className="mt-auto p-3">

          <div className="rounded-2xl bg-gradient-to-br from-[#6959e8] to-[#4d46b9] p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Sparkles size={17} />
            </div>

            <p className="text-sm font-bold">
              Earn with BankX
            </p>

            <p className="mt-1 text-[11px] leading-4 text-white/60">
              Put your assets to work.
            </p>

            <button
              onClick={() =>
                navigate("/vaults")
              }
              className="mt-3 w-full rounded-lg bg-white py-2 text-[11px] font-bold text-[#5549c8]"
            >
              Explore Vaults
            </button>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="h-screen overflow-hidden lg:ml-[235px]">

        {/* TOP NAVBAR */}

        <header className="h-[76px] shrink-0 border-b border-[#e9e9f0] bg-white px-5 sm:px-8">

          <div className="flex h-full items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                className="rounded-lg bg-[#f4f4fa] p-2.5 lg:hidden"
                onClick={() =>
                  setMobileMenu(true)
                }
              >
                <Menu size={20} />
              </button>

              <div>

                <h2 className="text-lg font-bold">
                  Savings
                </h2>

                <p className="text-[11px] text-gray-400">
                  Manage your BankX decentralized savings
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              {walletAddress && (
                <div className="hidden items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 sm:flex">

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                  <span className="text-[11px] font-semibold text-gray-500">
                    {networkName}
                  </span>

                </div>
              )}

              <button className="relative rounded-lg border border-gray-100 bg-white p-2.5">
                <Bell
                  size={18}
                  className="text-gray-500"
                />
              </button>

              {!walletAddress ? (

                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="flex items-center gap-2 rounded-lg bg-[#6558d9] px-5 py-2.5 text-[11px] font-bold text-white shadow-md shadow-indigo-100 disabled:opacity-60"
                >
                  <Wallet size={16} />

                  {connecting
                    ? "Connecting..."
                    : "Connect Wallet"}
                </button>

              ) : (

                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-2">

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

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

        {/* CONTENT */}

        <div className="h-[calc(100vh-76px)] overflow-y-auto p-5 sm:p-7">

          <div className="mx-auto max-w-[1500px]">

            {/* HEADER */}

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <p className="text-[12px] font-medium text-gray-400">
                  Your savings
                </p>

                <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                  Save & manage
                </h1>

                <p className="mt-2 text-[12px] text-gray-400">
                  Deposit and withdraw ETH directly through the BankX smart contract.
                </p>

              </div>

              {walletAddress && (
                <button
                  onClick={refreshSavings}
                  disabled={loading}
                  className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 sm:self-auto"
                >
                  <RefreshCw
                    size={14}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              )}

            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  messageType === "error"
                    ? "border-red-100 bg-red-50 text-red-600"
                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
                }`}
              >

                {messageType === "error" ? (
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}

                <p className="text-[11px] font-semibold">
                  {message}
                </p>

              </div>
            )}

            {/* STAT CARDS */}

            <div className="grid gap-5 md:grid-cols-3">

              <SavingsCard
                icon={CircleDollarSign}
                title="Total Savings"
                value={
                  walletAddress
                    ? `${savingsData.totalSavings} ETH`
                    : "—"
                }
                description={
                  walletAddress
                    ? "Your BankX savings"
                    : "Connect your wallet"
                }
                loading={loading}
              />

              <SavingsCard
                icon={Wallet}
                title="Wallet Balance"
                value={
                  walletAddress
                    ? `${ethBalance} ETH`
                    : "—"
                }
                description="Available in your wallet"
                loading={false}
              />

              <SavingsCard
                icon={Landmark}
                title="Active Loan"
                value={
                  walletAddress
                    ? `${savingsData.loanBalance} ETH`
                    : "—"
                }
                description="Current BankX loan"
                loading={loading}
              />

            </div>

            {/* DEPOSIT + WITHDRAW */}

            <div className="mt-6 grid gap-5 lg:grid-cols-2">

              {/* DEPOSIT */}

              <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <ArrowDownLeft size={21} />
                  </div>

                  <div>

                    <h3 className="text-lg font-extrabold">
                      Deposit ETH
                    </h3>

                    <p className="mt-1 text-[11px] text-gray-400">
                      Add ETH to your BankX savings
                    </p>

                  </div>

                </div>

                {!walletAddress ? (

                  <WalletRequired
                    connectWallet={connectWallet}
                    connecting={connecting}
                  />

                ) : (

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between">

                      <label className="text-[11px] font-bold text-gray-600">
                        Amount
                      </label>

                      <button
                        onClick={setMaxDeposit}
                        className="text-[10px] font-bold text-violet-600 hover:text-violet-800"
                      >
                        MAX
                      </button>

                    </div>

                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-1 focus-within:border-violet-400">

                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder="0.0000"
                        value={depositAmount}
                        onChange={(e) =>
                          setDepositAmount(
                            e.target.value
                          )
                        }
                        className="w-full bg-transparent py-3 text-lg font-bold outline-none"
                      />

                      <span className="rounded-lg bg-white px-3 py-2 text-[11px] font-extrabold text-gray-600 shadow-sm">
                        ETH
                      </span>

                    </div>

                    <div className="mt-3 flex justify-between">

                      <span className="text-[10px] text-gray-400">
                        Wallet balance
                      </span>

                      <span className="text-[10px] font-bold text-gray-600">
                        {ethBalance} ETH
                      </span>

                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={
                        depositing ||
                        !depositAmount
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6558d9] py-3.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac8] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <ArrowDownLeft size={16} />

                      {depositing
                        ? "Depositing..."
                        : "Deposit ETH"}

                    </button>

                    <p className="mt-3 text-center text-[10px] text-gray-400">
                      MetaMask will ask you to confirm this transaction.
                    </p>

                  </div>

                )}

              </div>

              {/* WITHDRAW */}

              <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <ArrowUpRight size={21} />
                  </div>

                  <div>

                    <h3 className="text-lg font-extrabold">
                      Withdraw ETH
                    </h3>

                    <p className="mt-1 text-[11px] text-gray-400">
                      Move your savings back to your wallet
                    </p>

                  </div>

                </div>

                {!walletAddress ? (

                  <WalletRequired
                    connectWallet={connectWallet}
                    connecting={connecting}
                  />

                ) : (

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between">

                      <label className="text-[11px] font-bold text-gray-600">
                        Amount
                      </label>

                      <button
                        onClick={setMaxWithdraw}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        MAX
                      </button>

                    </div>

                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-1 focus-within:border-emerald-400">

                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder="0.0000"
                        value={withdrawAmount}
                        onChange={(e) =>
                          setWithdrawAmount(
                            e.target.value
                          )
                        }
                        className="w-full bg-transparent py-3 text-lg font-bold outline-none"
                      />

                      <span className="rounded-lg bg-white px-3 py-2 text-[11px] font-extrabold text-gray-600 shadow-sm">
                        ETH
                      </span>

                    </div>

                    <div className="mt-3 flex justify-between">

                      <span className="text-[10px] text-gray-400">
                        Savings balance
                      </span>

                      <span className="text-[10px] font-bold text-gray-600">
                        {savingsData.totalSavings} ETH
                      </span>

                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={
                        withdrawing ||
                        !withdrawAmount ||
                        Number(withdrawAmount) >
                          Number(
                            savingsData.totalSavings
                          )
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#15966d] py-3.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-[#11845f] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <ArrowUpRight size={16} />

                      {withdrawing
                        ? "Withdrawing..."
                        : "Withdraw ETH"}

                    </button>

                    <p className="mt-3 text-center text-[10px] text-gray-400">
                      Withdrawal is limited to your BankX savings balance.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* BALANCE OVERVIEW */}

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">

              {/* SAVINGS POSITION */}

              <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <LockKeyhole size={19} />
                    </div>

                    <div>

                      <h3 className="text-lg font-extrabold">
                        Your savings position
                      </h3>

                      <p className="text-[11px] text-gray-400">
                        Live balance from BankX smart contract
                      </p>

                    </div>

                  </div>

                  {walletAddress && (
                    <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-bold text-emerald-600 sm:block">
                      On-chain
                    </span>
                  )}

                </div>

                <div className="mt-6 rounded-xl bg-[#fafafe] p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        BankX Savings
                      </p>

                      <p className="mt-2 text-3xl font-extrabold">
                        {walletAddress
                          ? `${savingsData.totalSavings} ETH`
                          : "—"}
                      </p>

                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-xl font-extrabold text-violet-600">
                      Ξ
                    </div>

                  </div>

                  <div className="mt-5 h-px bg-gray-200" />

                  <div className="mt-5 grid grid-cols-2 gap-5">

                    <div>

                      <p className="text-[10px] text-gray-400">
                        Pool Balance
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {walletAddress
                          ? `${savingsData.poolBalance} ETH`
                          : "—"}
                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] text-gray-400">
                        Active Loan
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {walletAddress
                          ? `${savingsData.loanBalance} ETH`
                          : "—"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* HOW IT WORKS */}

              <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6">

                <div className="flex items-center gap-3">

                  <Info
                    size={20}
                    className="text-violet-500"
                  />

                  <h3 className="text-base font-extrabold">
                    How savings works
                  </h3>

                </div>

                <div className="mt-6 space-y-6">

                  <Step
                    number="01"
                    title="Connect wallet"
                    text="Connect a wallet to access your BankX account."
                  />

                  <Step
                    number="02"
                    title="Deposit ETH"
                    text="Send ETH to the BankX smart contract and your savings balance increases."
                  />

                  <Step
                    number="03"
                    title="Track savings"
                    text="Your savings balance is read directly from the blockchain."
                  />

                  <Step
                    number="04"
                    title="Withdraw"
                    text="Withdraw any amount up to your available BankX savings balance."
                  />

                </div>

              </div>

            </div>

            {/* CONTRACT */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Network size={21} />
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold text-gray-400">
                      BankX Savings Contract
                    </p>

                    <h3 className="mt-1 text-base font-extrabold">
                      Connected & Active
                    </h3>

                    <p className="mt-1 break-all text-[10px] text-gray-400">
                      {legacyContractAddress || "Contract address not configured"}
                    </p>

                  </div>

                </div>

                <div className="rounded-xl bg-emerald-50 px-4 py-3">

                  <p className="text-[10px] font-bold text-emerald-600">
                    Live blockchain mode
                  </p>

                  <p className="mt-1 text-[9px] text-emerald-500">
                    Deposits and withdrawals enabled
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =====================================================
   NAV ITEM
===================================================== */

function NavItem({
  icon: Icon,
  label,
  path,
  active,
  navigate,
}) {
  return (
    <button
      onClick={() =>
        navigate(path)
      }
      className={`
        mb-1 flex w-full items-center gap-3
        rounded-lg px-3 py-3
        text-[12px] font-semibold transition
        ${
          active
            ? "bg-[#6255d5] text-white shadow-lg shadow-indigo-950/20"
            : "text-white/50 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

/* =====================================================
   SAVINGS CARD
===================================================== */

function SavingsCard({
  icon: Icon,
  title,
  value,
  description,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            {title}
          </p>

          {loading ? (

            <div className="mt-3 h-8 w-28 animate-pulse rounded bg-gray-100" />

          ) : (

            <h3 className="mt-2 text-2xl font-extrabold">
              {value}
            </h3>

          )}

          <p className="mt-1 text-[10px] text-gray-400">
            {description}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Icon size={20} />
        </div>

      </div>

    </div>
  );
}

/* =====================================================
   WALLET REQUIRED
===================================================== */

function WalletRequired({
  connectWallet,
  connecting,
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-9 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
        <Wallet size={28} />
      </div>

      <p className="mt-4 text-base font-bold text-gray-400">
        Wallet connection required
      </p>

      <p className="mx-auto mt-1 max-w-md text-[11px] leading-5 text-gray-300">
        Connect your wallet to access BankX savings.
      </p>

      <button
        onClick={connectWallet}
        disabled={connecting}
        className="mt-5 rounded-xl bg-[#6558d9] px-7 py-3 text-[11px] font-bold text-white disabled:opacity-60"
      >
        {connecting
          ? "Connecting..."
          : "Connect Wallet"}
      </button>

    </div>
  );
}

/* =====================================================
   STEP
===================================================== */

function Step({
  number,
  title,
  text,
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[10px] font-extrabold text-violet-600">
        {number}
      </div>

      <div>

        <p className="text-[12px] font-bold">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-gray-400">
          {text}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function getErrorMessage(error) {
  if (!error) {
    return "Transaction failed.";
  }

  if (
    error.code ===
    "ACTION_REJECTED"
  ) {
    return "Transaction rejected in MetaMask.";
  }

  if (error.code === 4001) {
    return "Transaction rejected in MetaMask.";
  }

  if (
    error.code ===
    "INSUFFICIENT_FUNDS"
  ) {
    return "Insufficient ETH. Keep some ETH for gas fees.";
  }

  if (error.reason) {
    return error.reason;
  }

  if (error.shortMessage) {
    return error.shortMessage;
  }

  if (error.message) {
    if (
      error.message.includes(
        "insufficient funds"
      )
    ) {
      return "Insufficient ETH. Keep some ETH for gas fees.";
    }

    if (
      error.message.includes(
        "user rejected"
      )
    ) {
      return "Transaction rejected in MetaMask.";
    }

    return error.message;
  }

  return "Transaction failed.";
}

/* =====================================================
   NETWORK NAME
===================================================== */

function getNetworkName(chainId) {
  const id =
    chainId.toString();

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

  return (
    networks[id] ||
    `Chain ${id}`
  );
}
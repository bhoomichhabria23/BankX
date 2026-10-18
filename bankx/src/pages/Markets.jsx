import { getWalletProvider } from "../config/wallet";
import {
  CircleDollarSign,
  Info,
  TrendingUp,
  Wallet,
  Activity,
  Coins,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Sidebar from "../components/Sidebar";
import {
  BANKX_ABI,
  getLegacyBankXAddress,
  getDeployment,
} from "../config/contract";
import { AMM_ABI, TOKEN_ABI } from "../config/ProtocolABIs";

/* =====================================================
   BANKX CONFIG
===================================================== */

/* =====================================================
   ADDRESS VALIDATION
===================================================== */

function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/* =====================================================
   MARKETS
===================================================== */

export default function Markets() {
  /* ===================================================
     STATE
  =================================================== */

  const [wallet, setWallet] = useState("");

  const [poolBalance, setPoolBalance] =
    useState("0");

  const [contractBalance, setContractBalance] =
    useState("0");

  const [userSavings, setUserSavings] =
    useState("0");

  const [userLoan, setUserLoan] =
    useState("0");

  const [loading, setLoading] =
    useState(false);

  const [network, setNetwork] =
    useState("");

  const [error, setError] =
    useState("");
  const [legacyContractAddress, setLegacyContractAddress] =
    useState("");
  const [protocolDeployment, setProtocolDeployment] = useState(null);
  const [protocolError, setProtocolError] = useState("");
  const [protocolStatus, setProtocolStatus] = useState("");
  const [protocolLoading, setProtocolLoading] = useState(false);
  const [protocolSubmitting, setProtocolSubmitting] = useState(false);
  const [protocolTab, setProtocolTab] = useState("swap");
  const [bankDecimals, setBankDecimals] = useState(18);
  const [usdcDecimals, setUsdcDecimals] = useState(6);
  const [bankWalletBalance, setBankWalletBalance] = useState(0n);
  const [usdcWalletBalance, setUsdcWalletBalance] = useState(0n);
  const [bankReserve, setBankReserve] = useState(0n);
  const [bankSeedBalance, setBankSeedBalance] = useState(0n);
  const [usdcReserve, setUsdcReserve] = useState(0n);
  const [lpBalance, setLpBalance] = useState(0n);
  const [lpSupply, setLpSupply] = useState(0n);
  const [ammFeeBps, setAmmFeeBps] = useState(0n);
  const [swapDirection, setSwapDirection] = useState("bank-to-usdc");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapQuote, setSwapQuote] = useState("");
  const [swapQuoteError, setSwapQuoteError] = useState("");
  const [minimumOutput, setMinimumOutput] = useState("");
  const swapQuoteRequest = useRef(0);
  const [initialUsdcAmount, setInitialUsdcAmount] = useState("");
  const [minimumInitialPrice, setMinimumInitialPrice] = useState("");
  const [liquidityBankAmount, setLiquidityBankAmount] = useState("");
  const [liquidityUsdcAmount, setLiquidityUsdcAmount] = useState("");
  const [minimumLpTokens, setMinimumLpTokens] = useState("");
  const [removeLpAmount, setRemoveLpAmount] = useState("");
  const [minimumBankOut, setMinimumBankOut] = useState("");
  const [minimumUsdcOut, setMinimumUsdcOut] = useState("");

  /* ===================================================
     LOAD MARKET DATA
  =================================================== */

  const loadMarketData = async () => {
    try {
      setError("");

      /* -----------------------------------------------
         METAMASK
      ------------------------------------------------ */

      if (!getWalletProvider()) {
        setError(
          "No wallet provider is available. Connect with WalletConnect or install a browser wallet."
        );

        return;
      }

      setLoading(true);

      /* -----------------------------------------------
         PROVIDER
      ------------------------------------------------ */

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      /* -----------------------------------------------
         NETWORK
      ------------------------------------------------ */

      const networkInfo =
        await provider.getNetwork();

      const chainId =
        networkInfo.chainId;

      console.log(
        "BankX Chain ID:",
        chainId.toString()
      );

      const accounts = await provider.send("eth_accounts", []);
      const walletAddress = accounts[0] || "";
      setWallet(walletAddress);

      const deployment = getDeployment(chainId);
      const contractAddress = getLegacyBankXAddress(chainId);
      if (!deployment || !contractAddress || !isValidAddress(contractAddress)) {
        setError(`BankX is not configured for chain ${chainId.toString()}.`);
        return;
      }
      setLegacyContractAddress(contractAddress);
      setNetwork(deployment.chainName || `Chain ${chainId.toString()}`);

      /* -----------------------------------------------
         CONTRACT
      ------------------------------------------------ */

      console.log(
        "BankX Contract:",
        contractAddress
      );

      const contract =
        new ethers.Contract(
          contractAddress,
          BANKX_ABI,
          provider
        );

      /* -----------------------------------------------
         CHECK CONTRACT
      ------------------------------------------------ */

      const code =
        await provider.getCode(
          contractAddress
        );

      if (code === "0x") {
        setError(
          "No smart contract was found at this address on Sepolia."
        );

        setLoading(false);

        return;
      }

      /* =================================================
         TOTAL POOL
      ================================================= */

      const pool =
        await contract.totalPool();

      const poolEth =
        ethers.formatEther(pool);

      setPoolBalance(
        Number(poolEth).toFixed(4)
      );

      /* =================================================
         CONTRACT BALANCE
      ================================================= */

      const contractEth =
        await provider.getBalance(
          contractAddress
        );

      setContractBalance(
        Number(
          ethers.formatEther(
            contractEth
          )
        ).toFixed(4)
      );

      /* =================================================
         CONNECTED WALLET
      ================================================= */

      if (!walletAddress) {
        setUserSavings("0");
        setUserLoan("0");

        return;
      }

      const address = walletAddress;

      console.log(
        "Wallet:",
        address
      );

      /* =================================================
         USER SAVINGS
      ================================================= */

      const savings =
        await contract.savings(
          address
        );

      setUserSavings(
        Number(
          ethers.formatEther(
            savings
          )
        ).toFixed(4)
      );

      /* =================================================
         USER LOAN
      ================================================= */

      const loan =
        await contract.loans(
          address
        );

      setUserLoan(
        Number(
          ethers.formatEther(
            loan
          )
        ).toFixed(4)
      );

    } catch (err) {
      console.error(
        "BankX market error:",
        err
      );

      setError(
        err?.shortMessage ||
          err?.reason ||
          err?.message ||
          "Unable to load BankX market data."
      );

    } finally {
      setLoading(false);
    }
  };

  const loadProtocolData = async () => {
    if (!getWalletProvider()) return;
    setProtocolLoading(true);
    setProtocolError("");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const networkInfo = await provider.getNetwork();
      const accounts = await provider.send("eth_accounts", []);
      const walletAddress = accounts[0] || "";
      setWallet(walletAddress);

      const activeDeployment = getDeployment(networkInfo.chainId);
      if (!activeDeployment?.BankXToken || !activeDeployment?.BankXAMM || !activeDeployment?.usdc) {
        throw new Error(`BANK/USDC trading is not configured for chain ${networkInfo.chainId.toString()}.`);
      }
      for (const address of [activeDeployment.BankXToken, activeDeployment.BankXAMM, activeDeployment.usdc]) {
        if ((await provider.getCode(address)) === "0x") throw new Error("A configured BANK/USDC contract has no code on this network.");
      }
      setProtocolDeployment(activeDeployment);

      const bank = new ethers.Contract(activeDeployment.BankXToken, TOKEN_ABI, provider);
      const usdc = new ethers.Contract(activeDeployment.usdc, TOKEN_ABI, provider);
      const amm = new ethers.Contract(activeDeployment.BankXAMM, AMM_ABI, provider);
      const [bankPrecision, usdcPrecision, bankPool, usdcPool, shareSupply, fee, seedBalance] = await Promise.all([
        bank.decimals(), usdc.decimals(), amm.reserveBank(), amm.reserveUsdc(), amm.totalSupply(), amm.feeBps(), bank.balanceOf(activeDeployment.BankXAMM),
      ]);
      setBankDecimals(Number(bankPrecision));
      setUsdcDecimals(Number(usdcPrecision));
      setBankReserve(bankPool);
      setBankSeedBalance(seedBalance);
      setUsdcReserve(usdcPool);
      setLpSupply(shareSupply);
      setAmmFeeBps(fee);
      if (walletAddress) {
        const [bankBalance, usdcBalance, userLp] = await Promise.all([
          bank.balanceOf(walletAddress), usdc.balanceOf(walletAddress), amm.balanceOf(walletAddress),
        ]);
        setBankWalletBalance(bankBalance);
        setUsdcWalletBalance(usdcBalance);
        setLpBalance(userLp);
      } else {
        setBankWalletBalance(0n);
        setUsdcWalletBalance(0n);
        setLpBalance(0n);
      }
    } catch (protocolLoadError) {
      setProtocolError(protocolLoadError.shortMessage || protocolLoadError.message || "Unable to load BANK/USDC data.");
    } finally {
      setProtocolLoading(false);
    }
  };

  const refreshAllMarkets = async () => {
    await Promise.all([loadMarketData(), loadProtocolData()]);
  };

  const previewSwap = async (amountText = swapAmount, direction = swapDirection) => {
    const requestId = ++swapQuoteRequest.current;
    setSwapQuoteError("");
    if (!protocolDeployment || !amountText || Number(amountText) <= 0) {
      setSwapQuote("");
      setMinimumOutput("");
      return;
    }
    try {
      if (bankReserve === 0n || usdcReserve === 0n) {
        setSwapQuote("");
        setMinimumOutput("");
        setSwapQuoteError("The pool has no liquidity yet. Open Liquidity and initialize the pool before swapping.");
        return;
      }
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const amm = new ethers.Contract(protocolDeployment.BankXAMM, AMM_ABI, provider);
      const amount = ethers.parseUnits(amountText, direction === "bank-to-usdc" ? bankDecimals : usdcDecimals);
      const quote = direction === "bank-to-usdc"
        ? await amm.quoteBankForUsdc(amount)
        : await amm.quoteUsdcForBank(amount);
      if (requestId !== swapQuoteRequest.current) return;
      const outputDecimals = direction === "bank-to-usdc" ? usdcDecimals : bankDecimals;
      setSwapQuote(quote === 0n ? "" : ethers.formatUnits(quote, outputDecimals));
      setMinimumOutput(ethers.formatUnits(quote * 9_950n / 10_000n, outputDecimals));
      if (quote === 0n) {
        setSwapQuoteError("This input is too small to receive any output from the pool.");
      }
    } catch (quoteError) {
      if (requestId !== swapQuoteRequest.current) return;
      setSwapQuote("");
      setMinimumOutput("");
      setSwapQuoteError(
        quoteError.shortMessage ||
          quoteError.reason ||
          quoteError.message ||
          "Unable to get a swap quote."
      );
    }
  };

  const ensureTokenAllowance = async (tokenAddress, spender, amount, signer) => {
    const token = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const ownerAddress = await signer.getAddress();
    if ((await token.allowance(ownerAddress, spender)) >= amount) return;
    const approval = await token.approve(spender, amount);
    setProtocolStatus(`Approval submitted: ${approval.hash}`);
    await approval.wait();
  };

  const submitProtocolAction = async (action) => {
    if (!getWalletProvider() || !protocolDeployment) return;
    setProtocolSubmitting(true);
    setProtocolError("");
    setProtocolStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const amm = new ethers.Contract(protocolDeployment.BankXAMM, AMM_ABI, signer);
      const deadlineBlock = await provider.getBlock("latest");
      const deadline = BigInt(deadlineBlock.timestamp + 600);
      let tx;

      if (action === "swap") {
        const inputIsBank = swapDirection === "bank-to-usdc";
        const inputAddress = inputIsBank ? protocolDeployment.BankXToken : protocolDeployment.usdc;
        const inputAmount = ethers.parseUnits(swapAmount, inputIsBank ? bankDecimals : usdcDecimals);
        const outputMinimum = ethers.parseUnits(minimumOutput, inputIsBank ? usdcDecimals : bankDecimals);
        if (inputAmount <= 0n || outputMinimum <= 0n) throw new Error("Enter a positive input and minimum output.");
        if (bankReserve === 0n || usdcReserve === 0n) {
          throw new Error("The pool has no liquidity yet. Initialize it from the Liquidity tab before swapping.");
        }
        const availableBalance = inputIsBank ? bankWalletBalance : usdcWalletBalance;
        if (inputAmount > availableBalance) {
          throw new Error(`Insufficient ${inputIsBank ? "BANK" : "USDC"} balance for this swap.`);
        }
        await ensureTokenAllowance(inputAddress, protocolDeployment.BankXAMM, inputAmount, signer);
        tx = inputIsBank
          ? await amm.swapBankForUsdc(inputAmount, outputMinimum, deadline)
          : await amm.swapUsdcForBank(inputAmount, outputMinimum, deadline);
      } else if (action === "initialize") {
        const usdcAmount = ethers.parseUnits(initialUsdcAmount, usdcDecimals);
        const minimumPrice = ethers.parseUnits(minimumInitialPrice, 18);
        const minimumLp = ethers.parseUnits(minimumLpTokens || "0", 18);
        if (usdcAmount <= 0n || minimumPrice <= 0n || minimumLp <= 0n) throw new Error("Set the USDC amount, minimum initial price, and minimum LP output.");
        const usdc = new ethers.Contract(protocolDeployment.usdc, TOKEN_ABI, signer);
        const ownerAddress = await signer.getAddress();
        const availableUsdc = await usdc.balanceOf(ownerAddress);
        if (usdcAmount > availableUsdc) {
          throw new Error(
            `Insufficient USDC: this wallet has ${ethers.formatUnits(availableUsdc, usdcDecimals)} USDC, but pool initialization requires ${ethers.formatUnits(usdcAmount, usdcDecimals)} USDC. Get test USDC on the same network or enter a smaller amount.`
          );
        }
        await ensureTokenAllowance(protocolDeployment.usdc, protocolDeployment.BankXAMM, usdcAmount, signer);
        tx = await amm.initializePool(usdcAmount, minimumPrice, minimumLp, deadline);
      } else if (action === "add") {
        const bankAmount = ethers.parseUnits(liquidityBankAmount, bankDecimals);
        const usdcAmount = ethers.parseUnits(liquidityUsdcAmount, usdcDecimals);
        const minimumLp = ethers.parseUnits(minimumLpTokens, 18);
        if (bankAmount <= 0n || usdcAmount <= 0n || minimumLp <= 0n) throw new Error("Set both deposit amounts and minimum LP output.");
        const usdc = new ethers.Contract(protocolDeployment.usdc, TOKEN_ABI, signer);
        const ownerAddress = await signer.getAddress();
        const availableUsdc = await usdc.balanceOf(ownerAddress);
        if (usdcAmount > availableUsdc) {
          throw new Error(
            `Insufficient USDC: this wallet has ${ethers.formatUnits(availableUsdc, usdcDecimals)} USDC, but adding liquidity requires ${ethers.formatUnits(usdcAmount, usdcDecimals)} USDC. Get test USDC on the same network or enter a smaller amount.`
          );
        }
        await ensureTokenAllowance(protocolDeployment.BankXToken, protocolDeployment.BankXAMM, bankAmount, signer);
        await ensureTokenAllowance(protocolDeployment.usdc, protocolDeployment.BankXAMM, usdcAmount, signer);
        tx = await amm.addLiquidity(bankAmount, usdcAmount, minimumLp, deadline);
      } else {
        const lpAmount = ethers.parseUnits(removeLpAmount, 18);
        const bankMinimum = ethers.parseUnits(minimumBankOut, bankDecimals);
        const usdcMinimum = ethers.parseUnits(minimumUsdcOut, usdcDecimals);
        if (lpAmount <= 0n || bankMinimum <= 0n || usdcMinimum <= 0n) throw new Error("Set the LP amount and positive minimum outputs for both assets.");
        tx = await amm.removeLiquidity(lpAmount, bankMinimum, usdcMinimum, deadline);
      }

      setProtocolStatus(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      setProtocolStatus("Transaction confirmed.");
      setSwapAmount("");
      setMinimumOutput("");
      await loadProtocolData();
    } catch (actionError) {
      setProtocolError(actionError.shortMessage || actionError.reason || actionError.message || "Protocol transaction failed.");
      setProtocolStatus("");
    } finally {
      setProtocolSubmitting(false);
    }
  };

  /* ===================================================
     CONNECT WALLET
  =================================================== */

  const connectWallet = async () => {
    try {
      if (!getWalletProvider()) {
        alert(
          "No browser wallet is available. Connect with WalletConnect or install a wallet extension."
        );

        return;
      }

      setError("");

      await getWalletProvider().request({
        method:
          "eth_requestAccounts",
      });

      await refreshAllMarkets();

    } catch (err) {
      console.error(
        "Wallet connection error:",
        err
      );

      setError(
        err?.message ||
          "Unable to connect wallet."
      );
    }
  };

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshAllMarkets(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* ===================================================
     WALLET EVENTS
  =================================================== */

  useEffect(() => {
    if (!getWalletProvider()) {
      return;
    }

    const handleAccountsChanged =
      () => {
        refreshAllMarkets();
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
  }, []);

  /* ===================================================
     CALCULATIONS
  =================================================== */

  const liquidity =
    Number(poolBalance);

  const activeLoan =
    Number(userLoan);

  const savings =
    Number(userSavings);

  const availableLiquidity =
    Math.max(
      liquidity - activeLoan,
      0
    );

  const netPosition =
    savings - activeLoan;

  const utilization =
    liquidity > 0
      ? Math.min(
          (activeLoan /
            liquidity) *
            100,
          100
        )
      : 0;

  /* ===================================================
     CHART DATA
  =================================================== */

  const liquidityChartData = [
    {
      name: "BankX",
      Pool: liquidity,
      Borrowed: activeLoan,
      Available:
        availableLiquidity,
    },
  ];

  const positionChartData = [
    {
      name: "Position",
      Savings: savings,
      Loan: activeLoan,
    },
  ];

  const utilizationChartData = [
    {
      name: "Borrowed",
      value: utilization,
    },
    {
      name: "Available",
      value:
        100 - utilization,
    },
  ];

  /* ===================================================
     UI
  =================================================== */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">

      <Sidebar />

      <main className="min-h-screen lg:ml-[245px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-[#e9e9f0] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-xl font-extrabold sm:text-2xl">
                Markets
              </h1>

              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                Explore BankX decentralized markets
              </p>

            </div>

            <div className="flex items-center gap-3">

              {/* NETWORK */}

              {network && (
                <div className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 sm:flex">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      network ===
                      "Sepolia"
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    }`}
                  />

                  <span className="text-[10px] font-bold text-gray-500">
                    {network}
                  </span>

                </div>
              )}

              {/* WALLET */}

              {!wallet ? (

                <button
                  onClick={
                    connectWallet
                  }
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:opacity-50"
                >

                  <Wallet
                    size={15}
                  />

                  {loading
                    ? "Loading..."
                    : "Connect Wallet"}

                </button>

              ) : (

                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-bold">

                    {wallet.slice(
                      0,
                      6
                    )}

                    ...

                    {wallet.slice(
                      -4
                    )}

                  </span>

                </div>

              )}

              {/* REFRESH */}

              <button
                onClick={
                          refreshAllMarkets
                }
                disabled={loading}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
              >

                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

              </button>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-5 sm:p-7 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* INTRO */}

            <div className="mb-7">

              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">
                Market overview
              </p>

              <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
                DeFi Markets
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Real-time liquidity and
                user position data from
                the BankX smart contract.
              </p>

            </div>

            <section className="mb-7 rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">BANK / USDC</p>
                  <h2 className="mt-1 text-xl font-extrabold">Exchange and liquidity</h2>
                  <p className="mt-1 text-xs text-gray-400">Live reserves · {Number(ammFeeBps) / 100}% pool fee · 0.5% default slippage limit</p>
                </div>
                <button onClick={loadProtocolData} disabled={protocolLoading} title="Refresh BANK/USDC pool" className="rounded-xl border border-gray-200 p-2.5 text-gray-500 disabled:opacity-50">
                  <RefreshCw size={16} className={protocolLoading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MarketMetric title="BANK reserve" value={`${ethers.formatUnits(bankReserve, bankDecimals)} BANK`} />
                <MarketMetric title="USDC reserve" value={`${ethers.formatUnits(usdcReserve, usdcDecimals)} USDC`} />
                <MarketMetric title="Your BANK" value={`${ethers.formatUnits(bankWalletBalance, bankDecimals)} BANK`} />
                <MarketMetric title="Your USDC" value={`${ethers.formatUnits(usdcWalletBalance, usdcDecimals)} USDC`} />
              </div>

              <div className="mt-5 inline-flex rounded-xl bg-gray-100 p-1" role="tablist" aria-label="BANK and USDC actions">
                <button onClick={() => setProtocolTab("swap")} className={`rounded-lg px-4 py-2 text-xs font-bold ${protocolTab === "swap" ? "bg-white text-[#202238] shadow-sm" : "text-gray-500"}`}>Swap</button>
                <button onClick={() => setProtocolTab("liquidity")} className={`rounded-lg px-4 py-2 text-xs font-bold ${protocolTab === "liquidity" ? "bg-white text-[#202238] shadow-sm" : "text-gray-500"}`}>Liquidity</button>
              </div>

              {protocolError && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">{protocolError}</p>}
              {protocolStatus && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">{protocolStatus}</p>}

              {!getWalletProvider() ? <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">Connect with WalletConnect or enable an injected wallet to trade.</p> : !protocolDeployment ? <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">No BANK/USDC deployment is configured for this network.</p> : !wallet ? <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">Connect a wallet to trade or provide liquidity.</p> : protocolTab === "swap" && (bankReserve === 0n || usdcReserve === 0n) ? (
                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-900">Swap pool is not initialized</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    The pool has no BANK/USDC reserves yet. Initialize it with USDC liquidity before trading; your wallet must hold USDC on this network.
                  </p>
                  <button
                    type="button"
                    onClick={() => setProtocolTab("liquidity")}
                    className="mt-3 rounded-lg bg-amber-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
                  >
                    Open liquidity setup
                  </button>
                </div>
              ) : protocolTab === "swap" ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Swap direction
                      <select value={swapDirection} onChange={(event) => { setSwapDirection(event.target.value); void previewSwap(swapAmount, event.target.value); }} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3">
                        <option value="bank-to-usdc">BANK to USDC</option>
                        <option value="usdc-to-bank">USDC to BANK</option>
                      </select>
                    </label>
                    <label className="mt-4 block text-xs font-semibold text-gray-600">Exact input ({swapDirection === "bank-to-usdc" ? "BANK" : "USDC"})
                      <input type="number" min="0" step="any" value={swapAmount} onChange={(event) => { setSwapAmount(event.target.value); void previewSwap(event.target.value); }} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" />
                    </label>
                  </div>
                  <div>
                    <div className="rounded-xl bg-[#fafafe] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Current quote</p>
                      <p className="mt-2 break-all text-lg font-extrabold">{swapQuote || "—"} {swapDirection === "bank-to-usdc" ? "USDC" : "BANK"}</p>
                    </div>
                    <label className="mt-4 block text-xs font-semibold text-gray-600">Minimum output ({swapDirection === "bank-to-usdc" ? "USDC" : "BANK"})
                      <input type="number" min="0" step="any" value={minimumOutput} onChange={(event) => setMinimumOutput(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" />
                    </label>
                    <p className="mt-2 text-[11px] leading-5 text-gray-400">Defaults to 0.5% below the quote as a slippage limit. Adjust it if needed; higher minimums may cause the transaction to revert.</p>
                  </div>
                  {swapQuoteError && <p role="alert" className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800 md:col-span-2">{swapQuoteError}</p>}
                  <button onClick={() => submitProtocolAction("swap")} disabled={protocolSubmitting || !swapAmount || !minimumOutput || !swapQuote} className="rounded-xl bg-[#6558d9] px-5 py-3 text-xs font-bold text-white disabled:opacity-50 md:col-span-2">
                    {protocolSubmitting ? "Processing..." : "Approve and swap"}
                  </button>
                </div>
              ) : bankReserve === 0n || usdcReserve === 0n ? (
                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-900">Initialize the pool</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">Protocol BANK seed currently held by the pool: {ethers.formatUnits(bankSeedBalance, bankDecimals)} BANK. The first liquidity provider sets the initial price; check the ratio before confirming.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="text-xs font-semibold text-gray-700">USDC to pair with seed
                      <input type="number" min="0" step="any" value={initialUsdcAmount} onChange={(event) => setInitialUsdcAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                      <span className="mt-1 block text-[10px] font-normal text-gray-500">Available in connected wallet: {ethers.formatUnits(usdcWalletBalance, usdcDecimals)} USDC</span>
                    </label>
                    <label className="text-xs font-semibold text-gray-700">Minimum accepted price (USDC per BANK)
                      <input type="number" min="0" step="any" value={minimumInitialPrice} onChange={(event) => setMinimumInitialPrice(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                    </label>
                    <label className="text-xs font-semibold text-gray-700">Minimum LP tokens
                      <input type="number" min="0" step="any" value={minimumLpTokens} onChange={(event) => setMinimumLpTokens(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                    </label>
                    <button onClick={() => submitProtocolAction("initialize")} disabled={protocolSubmitting || !initialUsdcAmount || !minimumInitialPrice || !minimumLpTokens} className="self-end rounded-xl bg-[#6558d9] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{protocolSubmitting ? "Processing..." : "Approve USDC and initialize"}</button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-xl bg-[#fafafe] p-4">
                    <h3 className="text-sm font-extrabold">Add liquidity</h3>
                    <p className="mt-1 text-[10px] text-gray-400">Your LP balance: {ethers.formatUnits(lpBalance, 18)} bxLP</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold text-gray-600">BANK amount<input type="number" min="0" step="any" value={liquidityBankAmount} onChange={(event) => setLiquidityBankAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3" /></label>
                      <label className="text-xs font-semibold text-gray-600">USDC amount<input type="number" min="0" step="any" value={liquidityUsdcAmount} onChange={(event) => setLiquidityUsdcAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3" /></label>
                      <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Minimum LP tokens<input type="number" min="0" step="any" value={minimumLpTokens} onChange={(event) => setMinimumLpTokens(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3" /></label>
                    </div>
                    <button onClick={() => submitProtocolAction("add")} disabled={protocolSubmitting || !liquidityBankAmount || !liquidityUsdcAmount || !minimumLpTokens} className="mt-4 rounded-lg bg-[#6558d9] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Approve and add liquidity</button>
                  </div>
                  <div className="rounded-xl bg-[#fafafe] p-4">
                    <h3 className="text-sm font-extrabold">Remove liquidity</h3>
                    <p className="mt-1 text-[10px] text-gray-400">Pool LP supply: {ethers.formatUnits(lpSupply, 18)} bxLP</p>
                    <div className="mt-4 grid gap-3">
                      <label className="text-xs font-semibold text-gray-600">LP tokens to burn<input type="number" min="0" max={ethers.formatUnits(lpBalance, 18)} step="any" value={removeLpAmount} onChange={(event) => setRemoveLpAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3" /></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-semibold text-gray-600">Minimum BANK<input type="number" min="0" step="any" value={minimumBankOut} onChange={(event) => setMinimumBankOut(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3" /></label>
                        <label className="text-xs font-semibold text-gray-600">Minimum USDC<input type="number" min="0" step="any" value={minimumUsdcOut} onChange={(event) => setMinimumUsdcOut(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3" /></label>
                      </div>
                    </div>
                    <button onClick={() => submitProtocolAction("remove")} disabled={protocolSubmitting || !removeLpAmount || !minimumBankOut || !minimumUsdcOut || lpBalance === 0n} className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 disabled:opacity-50">Remove liquidity</button>
                  </div>
                </div>
              )}
            </section>

            {/* ERROR */}

            {error && (

              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">

                <div className="flex gap-3">

                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div>

                    <p className="text-xs font-bold text-red-700">
                      Unable to load market data
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-red-600">
                      {error}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <MarketCard
                icon={
                  CircleDollarSign
                }
                title="Total Liquidity"
                value={`${poolBalance} ETH`}
                description="BankX protocol pool"
              />

              <MarketCard
                icon={
                  TrendingUp
                }
                title="Available Liquidity"
                value={`${availableLiquidity.toFixed(
                  4
                )} ETH`}
                description="Liquidity available"
              />

              <MarketCard
                icon={Coins}
                title="Supported Assets"
                value="1"
                description="ETH market"
              />

              <MarketCard
                icon={Activity}
                title="Contract Balance"
                value={`${contractBalance} ETH`}
                description="Actual ETH held"
              />

            </div>

            {/* =================================================
                ETH MARKET
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white shadow-sm">

              <div className="border-b border-gray-100 p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                      Available market
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold">
                      ETH Lending Market
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      BankX native ETH lending pool
                    </p>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">

                    <span className="text-xl font-extrabold">
                      Ξ
                    </span>

                  </div>

                </div>

              </div>

              {/* METRICS */}

              <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">

                <MarketMetric
                  title="Pool Liquidity"
                  value={`${poolBalance} ETH`}
                />

                <MarketMetric
                  title="Available"
                  value={`${availableLiquidity.toFixed(
                    4
                  )} ETH`}
                />

                <MarketMetric
                  title="Your Savings"
                  value={`${savings} ETH`}
                />

                <MarketMetric
                  title="Your Loan"
                  value={`${activeLoan} ETH`}
                />

              </div>

              {/* STATUS */}

              <div className="mx-6 mb-6 rounded-2xl bg-[#fafafe] p-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                      <Activity
                        size={18}
                      />

                    </div>

                    <div>

                      <p className="text-xs font-extrabold">
                        ETH Market
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        BankX smart contract market
                      </p>

                    </div>

                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-bold text-emerald-600">
                    ACTIVE
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                MARKET ANALYTICS
            ================================================= */}

            <div className="mt-8">

              <div className="mb-5">

                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">
                  Market analytics
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">
                  Market Performance
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Visual overview of BankX
                  liquidity and lending activity.
                </p>

              </div>

              <div className="grid gap-6 lg:grid-cols-2">

                {/* =================================================
                    LIQUIDITY CHART
                ================================================= */}

                <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

                  <div className="mb-5">

                    <h3 className="text-sm font-extrabold">
                      Liquidity Overview
                    </h3>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Pool vs borrowed vs available ETH
                    </p>

                  </div>

                  <div className="h-[280px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={
                          liquidityChartData
                        }
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fontSize: 10,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          formatter={(
                            value
                          ) =>
                            `${Number(
                              value
                            ).toFixed(
                              4
                            )} ETH`
                          }
                        />

                        <Bar
                          dataKey="Pool"
                          name="Pool"
                          fill="#6558d9"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                        />

                        <Bar
                          dataKey="Borrowed"
                          name="Borrowed"
                          fill="#f59e0b"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                        />

                        <Bar
                          dataKey="Available"
                          name="Available"
                          fill="#10b981"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

                {/* =================================================
                    USER POSITION CHART
                ================================================= */}

                <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

                  <div className="mb-5">

                    <h3 className="text-sm font-extrabold">
                      Your Position
                    </h3>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Savings versus active loan
                    </p>

                  </div>

                  <div className="h-[280px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={
                          positionChartData
                        }
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fontSize: 10,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          formatter={(
                            value
                          ) =>
                            `${Number(
                              value
                            ).toFixed(
                              4
                            )} ETH`
                          }
                        />

                        <Bar
                          dataKey="Savings"
                          name="Savings"
                          fill="#6558d9"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                        />

                        <Bar
                          dataKey="Loan"
                          name="Loan"
                          fill="#ef4444"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

                {/* =================================================
                    UTILIZATION
                ================================================= */}

                <div className="rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm lg:col-span-2">

                  <div className="flex flex-col items-center gap-8 md:flex-row">

                    <div className="flex-1">

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                        Lending utilization
                      </p>

                      <h3 className="mt-1 text-3xl font-extrabold">
                        {utilization.toFixed(
                          1
                        )}
                        %
                      </h3>

                      <p className="mt-2 max-w-lg text-xs leading-5 text-gray-400">

                        Percentage of the
                        BankX liquidity pool
                        currently represented
                        by active loans.

                      </p>

                      <div className="mt-5">

                        <div className="mb-2 flex justify-between text-[10px] font-semibold">

                          <span className="text-gray-400">
                            Utilization
                          </span>

                          <span className="text-violet-600">
                            {utilization.toFixed(
                              1
                            )}
                            %
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                          <div
                            className="h-full rounded-full bg-[#6558d9] transition-all duration-500"
                            style={{
                              width: `${utilization}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    <div className="h-[220px] w-full md:w-[320px]">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <PieChart>

                          <Pie
                            data={
                              utilizationChartData
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            startAngle={90}
                            endAngle={-270}
                          >

                            <Cell fill="#6558d9" />

                            <Cell fill="#eeeeF5" />

                          </Pie>

                          <Tooltip
                            formatter={(
                              value
                            ) =>
                              `${Number(
                                value
                              ).toFixed(
                                1
                              )}%`
                            }
                          />

                        </PieChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                USER POSITION
            ================================================= */}

            {wallet && (

              <div className="mt-8 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

                    <Wallet
                      size={19}
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-extrabold">
                      Your BankX position
                    </h3>

                    <p className="text-[10px] text-gray-400">
                      Live position for your connected wallet
                    </p>

                  </div>

                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">

                  <PositionCard
                    title="Savings"
                    value={`${savings} ETH`}
                    icon={Wallet}
                  />

                  <PositionCard
                    title="Active Loan"
                    value={`${activeLoan} ETH`}
                    icon={
                      ArrowUpRight
                    }
                  />

                  <PositionCard
                    title="Net Position"
                    value={`${netPosition.toFixed(
                      4
                    )} ETH`}
                    icon={
                      ShieldCheck
                    }
                  />

                </div>

              </div>

            )}

            {/* =================================================
                CONTRACT INFO
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-6">

              <div className="flex gap-4">

                <Info
                  size={21}
                  className="mt-0.5 shrink-0 text-violet-600"
                />

                <div>

                  <h3 className="text-sm font-extrabold text-violet-900">
                    Live blockchain market
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-violet-700/70">

                    The values shown on
                    this page are read
                    directly from the deployed
                    BankX smart contract on
                    the Sepolia network.

                  </p>

                  <p className="mt-3 break-all font-mono text-[10px] text-violet-600">

                    Contract:
                    {" "}
                    {legacyContractAddress ||
                      "Not configured"}

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
   MARKET CARD
===================================================== */

function MarketCard({
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

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

          <Icon size={18} />

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   MARKET METRIC
===================================================== */

function MarketMetric({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#fafafe] p-4">

      <p className="text-[10px] font-semibold text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-extrabold">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   POSITION CARD
===================================================== */

function PositionCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#fafafe] p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-semibold text-gray-400">
          {title}
        </p>

        <Icon
          size={17}
          className="text-violet-500"
        />

      </div>

      <p className="mt-3 text-xl font-extrabold">
        {value}
      </p>

    </div>
  );
}
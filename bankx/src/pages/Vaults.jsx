import { getWalletProvider } from "../config/wallet";
import {
  ArrowUpRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Info,
  RefreshCw,
  Activity,
  Coins,
} from "lucide-react";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Sidebar from "../components/Sidebar";
import {
  BANKX_ABI,
  getLegacyBankXAddress,
  getDeployment,
} from "../config/contract";
import {
  TOKEN_ABI,
  USDC_VAULT_ABI,
  VAULT_ABI,
} from "../config/ProtocolABIs";

export default function Vaults() {
  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState("0");
  const [savings, setSavings] = useState("0");
  const [poolBalance, setPoolBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");

  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [legacyContractAddress, setLegacyContractAddress] = useState("");
  const [vaultDeployment, setVaultDeployment] = useState(null);
  const [bankBalance, setBankBalance] = useState(0n);
  const [shareBalance, setShareBalance] = useState(0n);
  const [shareAssetValue, setShareAssetValue] = useState(0n);
  const [totalVaultAssets, setTotalVaultAssets] = useState(0n);
  const [maxVaultDeposit, setMaxVaultDeposit] = useState(0n);
  const [maxVaultMint, setMaxVaultMint] = useState(0n);
  const [maxVaultWithdraw, setMaxVaultWithdraw] = useState(0n);
  const [maxVaultRedeem, setMaxVaultRedeem] = useState(0n);
  const [vaultMode, setVaultMode] = useState("deposit");
  const [vaultAmount, setVaultAmount] = useState("");
  const [vaultQuote, setVaultQuote] = useState("");
  const [vaultProtocolError, setVaultProtocolError] = useState("");
  const [vaultProtocolStatus, setVaultProtocolStatus] = useState("");
  const [vaultProtocolSubmitting, setVaultProtocolSubmitting] = useState(false);
  const [usdcVaultDeployment, setUsdcVaultDeployment] = useState(null);
  const [usdcVaultTvl, setUsdcVaultTvl] = useState(0n);
  const [usdcWalletBalance, setUsdcWalletBalance] = useState(0n);
  const [usdcShareBalance, setUsdcShareBalance] = useState(0n);
  const [usdcShareAssets, setUsdcShareAssets] = useState(0n);
  const [usdcVaultMaxDeposit, setUsdcVaultMaxDeposit] = useState(0n);
  const [usdcVaultMaxWithdraw, setUsdcVaultMaxWithdraw] = useState(0n);
  const [usdcVaultMode, setUsdcVaultMode] = useState("deposit");
  const [usdcVaultAmount, setUsdcVaultAmount] = useState("");
  const [usdcVaultQuote, setUsdcVaultQuote] = useState("");
  const [usdcVaultError, setUsdcVaultError] = useState("");
  const [usdcVaultStatus, setUsdcVaultStatus] = useState("");
  const [usdcVaultSubmitting, setUsdcVaultSubmitting] = useState(false);

  /* =====================================================
     LOAD VAULT DATA
  ===================================================== */

  const loadVaultData = async () => {
    try {
      setError("");

      if (!getWalletProvider()) {
        setError("No wallet provider is available. Connect with WalletConnect or install a browser wallet.");
        return;
      }

      setLoading(true);

      const provider = new ethers.BrowserProvider(
        getWalletProvider()
      );

      /* NETWORK */

      const networkInfo = await provider.getNetwork();
      const accounts = await provider.send("eth_accounts", []);
      const address = accounts[0] || "";
      setWallet(address);

      const chainId = networkInfo.chainId.toString();
      const deployment = getDeployment(chainId);
      const contractAddress = getLegacyBankXAddress(chainId);
      if (!deployment || !contractAddress || !ethers.isAddress(contractAddress)) {
        setError(`BankX is not configured for chain ${chainId}.`);
        return;
      }
      if ((await provider.getCode(contractAddress)) === "0x") {
        setError("No legacy BankX contract code exists at the configured address.");
        return;
      }
      setLegacyContractAddress(contractAddress);

      setNetwork(
        deployment.chainName || `Chain ${chainId}`
      );

      /* BANKX CONTRACT */

      const contract = new ethers.Contract(
        contractAddress,
        BANKX_ABI,
        provider
      );

      /* WALLET */

      if (!address) {
        setWallet("");
        setSavings("0");
        setBalance("0");
        return;
      }

      /* WALLET ETH BALANCE */

      const walletBalance =
        await provider.getBalance(address);

      setBalance(
        Number(
          ethers.formatEther(walletBalance)
        ).toFixed(4)
      );

      /* BANKX POOL */

      const pool =
        await contract.totalPool();

      setPoolBalance(
        Number(
          ethers.formatEther(pool)
        ).toFixed(4)
      );

      /* ACTUAL CONTRACT BALANCE */

      const contractEth =
        await provider.getBalance(
          contractAddress
        );

      setContractBalance(
        Number(
          ethers.formatEther(contractEth)
        ).toFixed(4)
      );

      /* USER SAVINGS */

      const userSavings =
        await contract.savings(address);

      setSavings(
        Number(
          ethers.formatEther(userSavings)
        ).toFixed(4)
      );

    } catch (err) {
      console.error(
        "Vault loading error:",
        err
      );

      setError(
        err?.reason ||
        err?.shortMessage ||
        "Unable to load BankX vault data."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBankVaultData = async () => {
    if (!getWalletProvider()) return;
    setVaultProtocolError("");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const chain = await provider.getNetwork();
      const accounts = await provider.send("eth_accounts", []);
      const address = accounts[0] || "";
      setWallet(address);

      const activeDeployment = getDeployment(chain.chainId);
      if (!activeDeployment?.BankXToken || !activeDeployment?.BankXSavingsVault) {
        throw new Error(`BANK savings vault is not configured for chain ${chain.chainId.toString()}.`);
      }
      for (const address of [activeDeployment.BankXToken, activeDeployment.BankXSavingsVault]) {
        if ((await provider.getCode(address)) === "0x") throw new Error("A configured BANK vault contract has no code on this network.");
      }
      setVaultDeployment(activeDeployment);
      const token = new ethers.Contract(activeDeployment.BankXToken, TOKEN_ABI, provider);
      const vault = new ethers.Contract(activeDeployment.BankXSavingsVault, VAULT_ABI, provider);
      const [assets, depositLimit] = await Promise.all([
        vault.totalAssets(),
        address ? vault.maxDeposit(address) : Promise.resolve(0n),
      ]);
      setTotalVaultAssets(assets);
      setMaxVaultDeposit(depositLimit);
      if (address) {
        const [balanceValue, shares, withdrawLimit, mintLimit, redeemLimit] = await Promise.all([
          token.balanceOf(address),
          vault.balanceOf(address),
          vault.maxWithdraw(address),
          vault.maxMint(address),
          vault.maxRedeem(address),
        ]);
        setBankBalance(balanceValue);
        setShareBalance(shares);
        setShareAssetValue(await vault.convertToAssets(shares));
        setMaxVaultWithdraw(withdrawLimit);
        setMaxVaultMint(mintLimit);
        setMaxVaultRedeem(redeemLimit);
      } else {
        setBankBalance(0n);
        setShareBalance(0n);
        setShareAssetValue(0n);
        setMaxVaultWithdraw(0n);
        setMaxVaultMint(0n);
        setMaxVaultRedeem(0n);
      }
    } catch (loadError) {
      setVaultProtocolError(loadError.shortMessage || loadError.message || "Unable to load BANK vault data.");
    }
  };

  const loadUsdcVaultData = async () => {
    if (!getWalletProvider()) return;
    setUsdcVaultError("");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const chain = await provider.getNetwork();
      const accounts = await provider.send("eth_accounts", []);
      const address = accounts[0] || "";
      const activeDeployment = getDeployment(chain.chainId);
      if (!activeDeployment?.usdc || !activeDeployment?.BankXUsdcVault) {
        setUsdcVaultDeployment(null);
        setUsdcVaultTvl(0n);
        setUsdcWalletBalance(0n);
        setUsdcShareBalance(0n);
        setUsdcShareAssets(0n);
        setUsdcVaultMaxDeposit(0n);
        setUsdcVaultMaxWithdraw(0n);
        return;
      }
      for (const contractAddress of [activeDeployment.usdc, activeDeployment.BankXUsdcVault]) {
        if ((await provider.getCode(contractAddress)) === "0x") {
          throw new Error(`A configured USDC vault contract has no code at ${contractAddress}.`);
        }
      }
      const token = new ethers.Contract(activeDeployment.usdc, TOKEN_ABI, provider);
      const vault = new ethers.Contract(activeDeployment.BankXUsdcVault, USDC_VAULT_ABI, provider);
      const [asset, totalAssets] = await Promise.all([
        vault.asset(),
        vault.totalAssets(),
      ]);
      if (asset.toLowerCase() !== activeDeployment.usdc.toLowerCase()) {
        throw new Error("The configured USDC vault uses a different underlying token.");
      }
      setUsdcVaultDeployment(activeDeployment);
      setUsdcVaultTvl(totalAssets);
      if (address) {
        const [tokenBalance, shares, maxDeposit, maxWithdraw] = await Promise.all([
          token.balanceOf(address),
          vault.balanceOf(address),
          vault.maxDeposit(address),
          vault.maxWithdraw(address),
        ]);
        setUsdcWalletBalance(tokenBalance);
        setUsdcShareBalance(shares);
        setUsdcShareAssets(await vault.convertToAssets(shares));
        setUsdcVaultMaxDeposit(maxDeposit);
        setUsdcVaultMaxWithdraw(maxWithdraw);
      } else {
        setUsdcWalletBalance(0n);
        setUsdcShareBalance(0n);
        setUsdcShareAssets(0n);
        setUsdcVaultMaxDeposit(0n);
        setUsdcVaultMaxWithdraw(0n);
      }
    } catch (loadError) {
      setUsdcVaultDeployment(null);
      setUsdcVaultError(
        loadError.shortMessage ||
          loadError.reason ||
          loadError.message ||
          "Unable to load the USDC vault."
      );
    }
  };

  const previewUsdcVaultAction = async (amountText = usdcVaultAmount, mode = usdcVaultMode) => {
    setUsdcVaultError("");
    if (!usdcVaultDeployment || !amountText || Number(amountText) <= 0) {
      setUsdcVaultQuote("");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const vault = new ethers.Contract(usdcVaultDeployment.BankXUsdcVault, USDC_VAULT_ABI, provider);
      const amount = ethers.parseUnits(amountText, 6);
      const quote = mode === "deposit"
        ? await vault.previewDeposit(amount)
        : await vault.previewWithdraw(amount);
      setUsdcVaultQuote(ethers.formatUnits(quote, 6));
    } catch (quoteError) {
      setUsdcVaultQuote("");
      setUsdcVaultError(
        quoteError.shortMessage ||
          quoteError.reason ||
          quoteError.message ||
          "Unable to preview this USDC vault action."
      );
    }
  };

  const submitUsdcVaultAction = async () => {
    if (!wallet || !usdcVaultDeployment || !usdcVaultAmount) return;
    setUsdcVaultSubmitting(true);
    setUsdcVaultError("");
    setUsdcVaultStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();
      const token = new ethers.Contract(usdcVaultDeployment.usdc, TOKEN_ABI, signer);
      const vault = new ethers.Contract(usdcVaultDeployment.BankXUsdcVault, USDC_VAULT_ABI, signer);
      const amount = ethers.parseUnits(usdcVaultAmount, 6);
      if (amount <= 0n) throw new Error("Enter a positive USDC amount.");

      let tx;
      if (usdcVaultMode === "deposit") {
        if (amount > usdcWalletBalance) throw new Error("Insufficient USDC balance.");
        if (amount > usdcVaultMaxDeposit) throw new Error("The requested amount exceeds the vault deposit limit.");
        if ((await token.allowance(owner, usdcVaultDeployment.BankXUsdcVault)) < amount) {
          const approval = await token.approve(usdcVaultDeployment.BankXUsdcVault, amount);
          setUsdcVaultStatus(`USDC approval submitted: ${approval.hash}`);
          await approval.wait();
        }
        tx = await vault.deposit(amount, owner);
      } else {
        if (amount > usdcVaultMaxWithdraw) throw new Error("The requested amount exceeds your available USDC withdrawal limit.");
        tx = await vault.withdraw(amount, owner, owner);
      }

      setUsdcVaultStatus(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      setUsdcVaultAmount("");
      setUsdcVaultQuote("");
      setUsdcVaultStatus("USDC vault transaction confirmed.");
      await loadUsdcVaultData();
    } catch (transactionError) {
      setUsdcVaultError(
        transactionError.shortMessage ||
          transactionError.reason ||
          transactionError.message ||
          "USDC vault transaction failed."
      );
      setUsdcVaultStatus("");
    } finally {
      setUsdcVaultSubmitting(false);
    }
  };

  const previewBankVaultAction = async (amountText = vaultAmount, mode = vaultMode) => {
    if (!vaultDeployment || !amountText || Number(amountText) <= 0) {
      setVaultQuote("");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const vault = new ethers.Contract(vaultDeployment.BankXSavingsVault, VAULT_ABI, provider);
      const amount = ethers.parseEther(amountText);
      const quote = mode === "deposit" ? await vault.previewDeposit(amount)
        : mode === "mint" ? await vault.previewMint(amount)
          : mode === "withdraw" ? await vault.previewWithdraw(amount)
            : await vault.previewRedeem(amount);
      setVaultQuote(ethers.formatEther(quote));
    } catch {
      setVaultQuote("");
    }
  };

  const submitBankVaultAction = async () => {
    if (!wallet || !vaultDeployment || !vaultAmount) return;
    setVaultProtocolSubmitting(true);
    setVaultProtocolError("");
    setVaultProtocolStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();
      const token = new ethers.Contract(vaultDeployment.BankXToken, TOKEN_ABI, signer);
      const vault = new ethers.Contract(vaultDeployment.BankXSavingsVault, VAULT_ABI, signer);
      const amount = ethers.parseEther(vaultAmount);
      let tx;

      if (vaultMode === "deposit" || vaultMode === "mint") {
        const limit = vaultMode === "deposit"
          ? await vault.maxDeposit(owner)
          : await vault.maxMint(owner);
        if (amount > limit) throw new Error("The requested amount exceeds the current vault limit.");
        const assetsToApprove = vaultMode === "deposit" ? amount : await vault.previewMint(amount);
        if ((await token.allowance(owner, vaultDeployment.BankXSavingsVault)) < assetsToApprove) {
          const approval = await token.approve(vaultDeployment.BankXSavingsVault, assetsToApprove);
          setVaultProtocolStatus(`Approval submitted: ${approval.hash}`);
          await approval.wait();
        }
        tx = vaultMode === "deposit"
          ? await vault.deposit(amount, owner)
          : await vault.mint(amount, owner);
      } else {
        const limit = vaultMode === "withdraw"
          ? await vault.maxWithdraw(owner)
          : await vault.maxRedeem(owner);
        if (amount > limit) throw new Error("The requested amount exceeds the current vault limit.");
        tx = vaultMode === "withdraw"
          ? await vault.withdraw(amount, owner, owner)
          : await vault.redeem(amount, owner, owner);
      }

      setVaultProtocolStatus(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      setVaultAmount("");
      setVaultProtocolStatus("Vault transaction confirmed.");
      await loadBankVaultData();
    } catch (transactionError) {
      setVaultProtocolError(transactionError.shortMessage || transactionError.reason || transactionError.message || "Vault transaction failed.");
      setVaultProtocolStatus("");
    } finally {
      setVaultProtocolSubmitting(false);
    }
  };

  /* =====================================================
     CONNECT WALLET
  ===================================================== */

  const connectWallet = async () => {
    try {
      if (!getWalletProvider()) {
        alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
        return;
      }

      setConnecting(true);

      await getWalletProvider().request({
        method: "eth_requestAccounts",
      });

      await Promise.all([loadVaultData(), loadBankVaultData(), loadUsdcVaultData()]);

    } catch (err) {
      console.error(
        "Wallet connection failed:",
        err
      );

      setError(
        err?.message ||
        "Unable to connect wallet."
      );
    } finally {
      setConnecting(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => { void Promise.all([loadVaultData(), loadBankVaultData(), loadUsdcVaultData()]); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* =====================================================
     WALLET EVENTS
  ===================================================== */

  useEffect(() => {
    if (!getWalletProvider()) return;

    const handleAccountsChanged = () => {
      Promise.all([loadVaultData(), loadBankVaultData(), loadUsdcVaultData()]);
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

  /* =====================================================
     VALUES
  ===================================================== */

  const pool =
    Number(poolBalance);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">

      <Sidebar />

      <main className="min-h-screen lg:ml-[235px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-[#e9e9f0] bg-white/95 px-5 py-5 backdrop-blur sm:px-8">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-extrabold">
                Vaults
              </h1>

              <p className="mt-1 text-xs text-gray-400">
                Manage your on-chain asset deposits
              </p>

            </div>

            <div className="flex items-center gap-3">

              {network && (
                <div className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 sm:flex">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-bold text-gray-500">
                    {network}
                  </span>

                </div>
              )}

              {!wallet ? (

                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-[#574ac9] disabled:opacity-60"
                >

                  <Wallet size={15} />

                  {connecting
                    ? "Connecting..."
                    : "Connect Wallet"}

                </button>

              ) : (

                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-bold">

                    {wallet.slice(0, 6)}
                    ...
                    {wallet.slice(-4)}

                  </span>

                </div>

              )}

              <button
                onClick={() => { void Promise.all([loadVaultData(), loadBankVaultData(), loadUsdcVaultData()]); }}
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

            {/* =================================================
                HERO
            ================================================= */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#29235d] via-[#3d347d] to-[#6558d9] p-7 text-white sm:p-9">

              <div className="relative z-10 max-w-2xl">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">

                  <Sparkles size={21} />

                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  BankX Vaults
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Manage your assets with Vaults
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">

                  Deposit ETH into the BankX smart
                  contract and track your savings position
                  directly on the Sepolia blockchain.

                </p>

                {!wallet && (

                  <button
                    onClick={connectWallet}
                    disabled={connecting}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#5549c8] shadow-lg disabled:opacity-60"
                  >

                    <Wallet size={16} />

                    {connecting
                      ? "Connecting..."
                      : "Connect Wallet"}

                  </button>

                )}

              </div>

              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />

              <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-white/5" />

              <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 lg:block">

                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/5">

                  <LockKeyhole
                    size={48}
                    className="text-white/60"
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">

                <div className="flex gap-3">

                  <Info
                    size={18}
                    className="mt-0.5 text-red-500"
                  />

                  <div>

                    <p className="text-xs font-bold text-red-700">
                      Unable to load vault data
                    </p>

                    <p className="mt-1 text-[11px] text-red-600">
                      {error}
                    </p>

                  </div>

                </div>

              </div>

            )}

            <section className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">ERC-4626</p>
                  <h2 className="mt-1 text-xl font-extrabold">BANK savings vault</h2>
                  <p className="mt-1 text-xs text-gray-400">BANK assets are exchanged for bxBANK shares using live vault conversions.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Total vault assets</p>
                  <p className="mt-1 text-lg font-extrabold">{ethers.formatEther(totalVaultAssets)} BANK</p>
                </div>
              </div>

              {vaultProtocolError && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">{vaultProtocolError}</p>}
              {vaultProtocolStatus && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">{vaultProtocolStatus}</p>}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <LiveMetric title="Wallet BANK" value={`${ethers.formatEther(bankBalance)} BANK`} />
                <LiveMetric title="bxBANK shares" value={`${ethers.formatEther(shareBalance)} bxBANK`} />
                <LiveMetric title="Share value" value={`${ethers.formatEther(shareAssetValue)} BANK`} />
              </div>

              <div className="mt-5 inline-flex flex-wrap rounded-xl bg-gray-100 p-1" role="tablist" aria-label="ERC-4626 actions">
                {["deposit", "mint", "withdraw", "redeem"].map((mode) => (
                  <button key={mode} type="button" onClick={() => { setVaultMode(mode); void previewBankVaultAction(vaultAmount, mode); }} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize ${vaultMode === mode ? "bg-white text-[#202238] shadow-sm" : "text-gray-500"}`}>{mode}</button>
                ))}
              </div>

              {!wallet ? <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">Connect a wallet to use the BANK vault.</p> : !vaultDeployment ? <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">No BANK vault deployment is configured for this network.</p> : (
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <label className="text-xs font-semibold text-gray-600">{vaultMode === "deposit" || vaultMode === "withdraw" ? "BANK assets" : "bxBANK shares"}
                    <input type="number" min="0" step="any" value={vaultAmount} onChange={(event) => { setVaultAmount(event.target.value); void previewBankVaultAction(event.target.value); }} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" />
                  </label>
                  <div className="rounded-xl bg-[#fafafe] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Preview {vaultMode === "deposit" ? "shares" : vaultMode === "mint" ? "BANK required" : vaultMode === "withdraw" ? "shares burned" : "BANK returned"}</p>
                    <p className="mt-2 break-all text-base font-extrabold">{vaultQuote || "—"}</p>
                  </div>
                  <button onClick={submitBankVaultAction} disabled={vaultProtocolSubmitting || !vaultAmount || Number(vaultAmount) <= 0 || !vaultQuote} className="rounded-xl bg-[#6558d9] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{vaultProtocolSubmitting ? "Processing..." : `${vaultMode} ${vaultMode === "deposit" || vaultMode === "withdraw" ? "BANK" : "shares"}`}</button>
                </div>
              )}

              {wallet && <p className="mt-3 text-[10px] text-gray-400">Max deposit {ethers.formatEther(maxVaultDeposit)} BANK · Max mint {ethers.formatEther(maxVaultMint)} bxBANK · Max withdraw {ethers.formatEther(maxVaultWithdraw)} BANK · Max redeem {ethers.formatEther(maxVaultRedeem)} bxBANK</p>}
            </section>

            <section id="usdc-vault" className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">ERC-4626 · USDC</p>
                  <h2 className="mt-1 text-xl font-extrabold">USDC deposit vault</h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">
                    Deposit Circle Sepolia USDC and receive redeemable bxUSDC shares.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Total vault assets</p>
                  <p className="mt-1 text-lg font-extrabold">{ethers.formatUnits(usdcVaultTvl, 6)} USDC</p>
                </div>
              </div>

              {usdcVaultError && <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">{usdcVaultError}</p>}
              {usdcVaultStatus && <p role="status" className="mt-4 break-all rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">{usdcVaultStatus}</p>}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <LiveMetric title="Wallet USDC" value={`${ethers.formatUnits(usdcWalletBalance, 6)} USDC`} />
                <LiveMetric title="bxUSDC shares" value={`${ethers.formatUnits(usdcShareBalance, 6)} bxUSDC`} />
                <LiveMetric title="Share value" value={`${ethers.formatUnits(usdcShareAssets, 6)} USDC`} />
              </div>

              {!wallet ? (
                <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">Connect your Sepolia wallet to deposit or withdraw USDC.</p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
                  <div className="inline-flex rounded-xl bg-gray-100 p-1">
                    {["deposit", "withdraw"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setUsdcVaultMode(mode);
                          void previewUsdcVaultAction(usdcVaultAmount, mode);
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-bold capitalize ${usdcVaultMode === mode ? "bg-white text-[#202238] shadow-sm" : "text-gray-500"}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <label className="text-xs font-semibold text-gray-600">
                    {usdcVaultMode === "deposit" ? "USDC amount" : "USDC to withdraw"}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={usdcVaultAmount}
                      onChange={(event) => {
                        setUsdcVaultAmount(event.target.value);
                        void previewUsdcVaultAction(event.target.value);
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"
                    />
                  </label>
                  <div className="rounded-xl bg-[#fafafe] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {usdcVaultMode === "deposit" ? "Estimated bxUSDC shares" : "Estimated shares burned"}
                    </p>
                    <p className="mt-2 break-all text-base font-extrabold">{usdcVaultQuote || "—"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={submitUsdcVaultAction}
                    disabled={usdcVaultSubmitting || !usdcVaultAmount || Number(usdcVaultAmount) <= 0 || !usdcVaultQuote}
                    className="rounded-xl bg-[#6558d9] px-5 py-3 text-xs font-bold capitalize text-white disabled:opacity-50"
                  >
                    {usdcVaultSubmitting ? "Processing..." : usdcVaultMode === "deposit" ? "Approve & deposit" : "Withdraw"}
                  </button>
                </div>
              )}
              {wallet && (
                <p className="mt-3 text-[10px] text-gray-400">
                  Max deposit {ethers.formatUnits(usdcVaultMaxDeposit, 6)} USDC · Max withdraw {ethers.formatUnits(usdcVaultMaxWithdraw, 6)} USDC
                </p>
              )}
              {usdcVaultDeployment && (
                <p className="mt-3 break-all text-[10px] text-gray-400">
                  USDC: {usdcVaultDeployment.usdc} · Vault: {usdcVaultDeployment.BankXUsdcVault}
                </p>
              )}
            </section>

            {/* =================================================
                LIVE BANKX DATA
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                    Live blockchain data
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold">
                    BankX ETH Vault
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Real values read from your deployed BankX contract
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

                  <Coins size={20} />

                </div>

              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <LiveMetric
                  title="Your Deposit"
                  value={`${savings} ETH`}
                />

                <LiveMetric
                  title="BankX Pool"
                  value={`${poolBalance} ETH`}
                />

                <LiveMetric
                  title="Contract Balance"
                  value={`${contractBalance} ETH`}
                />

              </div>

            </div>

            {/* =================================================
                AVAILABLE STRATEGIES
            ================================================= */}

            <div className="mt-8 flex items-end justify-between">

              <div>

                <p className="text-xs font-semibold text-gray-400">
                  Available Strategies
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">
                  Explore Vaults
                </h2>

              </div>

              <div className="hidden text-xs text-gray-400 sm:block">
                Select a supported asset
              </div>

            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">

              {/* ETH */}

              <VaultCard
                icon="ETH"
                name="ETH Savings Vault"
                description="Store ETH in the BankX decentralized savings pool and track your on-chain position."
                tvl={`${pool.toFixed(4)} ETH`}
                risk="Medium"
                asset="ETH"
                active
                wallet={wallet}
                savings={savings}
                balance={balance}
              />

              {/* USDC */}

              <VaultCard
                icon="USDC"
                name="USDC Deposit Vault"
                description="Deposit and withdraw USDC for redeemable vault shares."
                tvl={usdcVaultDeployment ? `${ethers.formatUnits(usdcVaultTvl, 6)} USDC` : "—"}
                risk="Low"
                asset="USDC"
                active={Boolean(usdcVaultDeployment)}
                disabledLabel={usdcVaultError ? "Unavailable" : "Deployment Required"}
                actionContent={
                  usdcVaultDeployment ? (
                    <>
                      <div className="mt-5 rounded-xl bg-violet-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-violet-400">
                              Your deposit
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-violet-700">
                              {Number(ethers.formatUnits(usdcShareAssets, 6)).toFixed(4)} USDC
                            </p>
                          </div>
                          <ShieldCheck size={20} className="text-violet-500" />
                        </div>
                        <p className="mt-2 text-[10px] text-violet-500/70">
                          Wallet balance: {Number(ethers.formatUnits(usdcWalletBalance, 6)).toFixed(4)} USDC
                        </p>
                      </div>
                      <a href="#usdc-vault" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-50 py-3 text-xs font-bold text-violet-700 hover:bg-violet-100">
                        Deposit or withdraw USDC
                        <ArrowUpRight size={15} />
                      </a>
                    </>
                  ) : null
                }
              />

            </div>

            {/* =================================================
                YOUR POSITION
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold text-gray-400">
                    Portfolio
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold">
                    Your Vault Position
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Your live BankX savings position
                  </p>

                </div>

                <Activity
                  size={21}
                  className="text-violet-500"
                />

              </div>

              {!wallet ? (

                <div className="mt-6 flex min-h-[190px] items-center justify-center rounded-xl bg-[#fafafe]">

                  <div className="text-center">

                    <Wallet
                      size={28}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-4 text-sm font-bold text-gray-400">
                      Connect your wallet
                    </p>

                    <p className="mt-1 text-xs text-gray-300">
                      Connect a wallet to see your BankX position.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="mt-6">

                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-600">

                          <Wallet size={20} />

                        </div>

                        <div>

                          <p className="text-xs font-extrabold">
                            ETH Savings
                          </p>

                          <p className="text-[10px] text-gray-400">
                            BankX smart contract
                          </p>

                        </div>

                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-bold text-emerald-600">
                        ACTIVE
                      </span>

                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">

                      <PositionMetric
                        title="Deposited"
                        value={`${savings} ETH`}
                      />

                      <PositionMetric
                        title="Wallet Balance"
                        value={`${balance} ETH`}
                      />

                    </div>

                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                HOW IT WORKS
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

                  <Info size={19} />

                </div>

                <div>

                  <h3 className="text-lg font-extrabold">
                    How BankX Vaults work
                  </h3>

                  <p className="text-xs text-gray-400">
                    Simple decentralized savings flow
                  </p>

                </div>

              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-3">

                <VaultStep
                  number="01"
                  title="Connect wallet"
                  text="Connect a wallet to your BankX application."
                />

                <VaultStep
                  number="02"
                  title="Deposit ETH"
                  text="Deposit ETH into the BankX smart contract."
                />

                <VaultStep
                  number="03"
                  title="Track position"
                  text="Your savings balance is read directly from the blockchain."
                />

              </div>

            </div>

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500">

                  <ShieldCheck size={20} />

                </div>

                <div>

                  <h3 className="text-sm font-extrabold text-emerald-800">
                    Smart contract powered
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-emerald-700/70">

                    Your BankX savings position is read
                    directly from the deployed smart contract
                    on the Sepolia network.

                  </p>

                </div>

              </div>

            </div>

            {/* CONTRACT ADDRESS */}

            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">

              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                BankX Contract
              </p>

              <p className="mt-2 break-all font-mono text-xs text-violet-800">
                {legacyContractAddress || "Contract address not configured"}
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =====================================================
   VAULT STAT
===================================================== */

function VaultStat({
  icon: Icon,
  title,
  value,
  description,
  iconBg,
  iconColor,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-semibold text-gray-400">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-extrabold">
            {value}
          </h3>

          <p className="mt-1 text-[10px] text-gray-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon size={18} />
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   VAULT CARD
===================================================== */

function VaultCard({
  icon,
  name,
  description,
  tvl,
  risk,
  asset,
  active,
  disabledLabel = "Coming Soon",
  actionContent,
  savings,
  balance,
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
        active
          ? "border-violet-200 hover:-translate-y-0.5 hover:shadow-lg"
          : "border-[#e9e9f0]"
      }`}
    >

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-extrabold ${
              active
                ? "bg-[#211d4f] text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {icon}
          </div>

          <div>

            <h3 className="text-base font-extrabold">
              {name}
            </h3>

            <p className="mt-1 text-[11px] text-gray-400">
              {asset} Vault
            </p>

          </div>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-[9px] font-bold ${
            active
              ? "bg-emerald-100 text-emerald-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {active ? "ACTIVE" : `${risk} Risk`}
        </span>

      </div>

      <p className="mt-5 text-xs leading-5 text-gray-400">
        {description}
      </p>

      <div className="mt-6">

        <div className="rounded-xl bg-[#fafafe] p-4">

          <p className="text-[9px] uppercase tracking-wider text-gray-400">
            TVL
          </p>

          <p className="mt-1 text-lg font-extrabold">
            {tvl}
          </p>

        </div>

      </div>

      {actionContent ? actionContent : active ? (

        <div className="mt-5 rounded-xl bg-violet-50 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[9px] uppercase tracking-wider text-violet-400">
                Your deposit
              </p>

              <p className="mt-1 text-lg font-extrabold text-violet-700">
                {savings} ETH
              </p>

            </div>

            <ShieldCheck
              size={20}
              className="text-violet-500"
            />

          </div>

          <p className="mt-2 text-[10px] text-violet-500/70">

            Wallet balance: {balance} ETH

          </p>

        </div>

      ) : (

        <button
          disabled
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-400"
        >

          {disabledLabel}

          <ArrowUpRight size={15} />

        </button>

      )}

    </div>
  );
}


/* =====================================================
   LIVE METRIC
===================================================== */

function LiveMetric({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#fafafe] p-5">

      <p className="text-[10px] font-semibold text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-xl font-extrabold">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   POSITION METRIC
===================================================== */

function PositionMetric({
  title,
  value,
}) {
  return (
    <div className="rounded-xl bg-white p-4">

      <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-extrabold">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   VAULT STEP
===================================================== */

function VaultStep({
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

        <h4 className="text-sm font-bold">
          {title}
        </h4>

        <p className="mt-1 text-xs leading-5 text-gray-400">
          {text}
        </p>

      </div>

    </div>
  );
}
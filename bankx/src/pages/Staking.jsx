import { getWalletProvider } from "../config/wallet";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Coins, RefreshCw, Wallet } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getDeployment } from "../config/contract";
import { STAKING_ABI, TOKEN_ABI } from "../config/ProtocolABIs";

export default function Staking() {
  const [account, setAccount] = useState("");
  const [deployment, setDeployment] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0n);
  const [stakedBalance, setStakedBalance] = useState(0n);
  const [earned, setEarned] = useState(0n);
  const [rewardReserve, setRewardReserve] = useState(0n);
  const [rewardBudgetCap, setRewardBudgetCap] = useState(0n);
  const [rewardRatePerDay, setRewardRatePerDay] = useState(0n);
  const [periodFinish, setPeriodFinish] = useState(0n);
  const [totalStaked, setTotalStaked] = useState(0n);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    if (!getWalletProvider()) {
      setError("No wallet provider is available. Connect with WalletConnect or install a browser wallet.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const chain = await provider.getNetwork();
      const accounts = await provider.send("eth_accounts", []);
      const wallet = accounts[0] || "";
      setAccount(wallet);

      const activeDeployment = getDeployment(chain.chainId);
      setDeployment(activeDeployment);
      if (!activeDeployment?.BankXStaking || !activeDeployment?.BankXToken) {
        throw new Error(`BankX staking is not deployed on chain ${chain.chainId.toString()}.`);
      }

      const staking = new ethers.Contract(activeDeployment.BankXStaking, STAKING_ABI, provider);
      const [reserve, total, budget, rate, finish] = await Promise.all([
        staking.rewardReserve(),
        staking.totalStaked(),
        staking.REWARD_BUDGET_CAP(),
        staking.rewardRatePerSecond(),
        staking.periodFinish(),
      ]);
      setRewardReserve(reserve);
      setTotalStaked(total);
      setRewardBudgetCap(budget);
      setRewardRatePerDay(rate * 86400n);
      setPeriodFinish(finish);
      if (wallet) {
        const token = new ethers.Contract(activeDeployment.BankXToken, TOKEN_ABI, provider);
        const [balance, staked, rewards] = await Promise.all([
          token.balanceOf(wallet),
          staking.stakedBalance(wallet),
          staking.earned(wallet),
        ]);
        setWalletBalance(balance);
        setStakedBalance(staked);
        setEarned(rewards);
      } else {
        setWalletBalance(0n);
        setStakedBalance(0n);
        setEarned(0n);
      }
    } catch (loadError) {
      setError(loadError.shortMessage || loadError.message || "Unable to load staking data.");
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!getWalletProvider()) {
      setError("No wallet provider is available. Connect with WalletConnect or install a browser wallet.");
      return;
    }
    try {
      await getWalletProvider().request({ method: "eth_requestAccounts" });
      await load();
    } catch (connectError) {
      setError(connectError.shortMessage || connectError.message || "Wallet connection failed.");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    if (!getWalletProvider()) return () => window.clearTimeout(timer);
    const onAccountsChanged = () => load();
    const onChainChanged = () => window.location.reload();
    getWalletProvider().on("accountsChanged", onAccountsChanged);
    getWalletProvider().on("chainChanged", onChainChanged);
    return () => {
      window.clearTimeout(timer);
      getWalletProvider().removeListener("accountsChanged", onAccountsChanged);
      getWalletProvider().removeListener("chainChanged", onChainChanged);
    };
  }, []);

  const transact = async (operation) => {
    if (!account || !deployment) return;
    setSubmitting(true);
    setError("");
    setStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const staking = new ethers.Contract(deployment.BankXStaking, STAKING_ABI, signer);
      const token = new ethers.Contract(deployment.BankXToken, TOKEN_ABI, signer);
      let tx;
      const value = ethers.parseEther(amount);
      if (operation === "stake") {
        const allowance = await token.allowance(account, deployment.BankXStaking);
        if (allowance < value) {
          const approval = await token.approve(deployment.BankXStaking, value);
          setStatus(`Approval submitted: ${approval.hash}`);
          await approval.wait();
        }
        tx = await staking.stake(value);
      } else if (operation === "unstake") {
        tx = await staking.unstake(value);
      } else {
        tx = await staking.claimRewards();
      }
      setStatus(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      setAmount("");
      setStatus("Transaction confirmed.");
      await load();
    } catch (transactionError) {
      setError(transactionError.shortMessage || transactionError.reason || transactionError.message || "Transaction failed.");
      setStatus("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#202238]">
      <Sidebar />
      <main className="min-h-screen lg:ml-[235px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e9e9f0] bg-white/95 px-5 py-5 backdrop-blur sm:px-8">
          <div><h1 className="text-2xl font-extrabold">Staking</h1><p className="mt-1 text-xs text-gray-400">BANK deposits and funded rewards</p></div>
          <div className="flex items-center gap-3">
            {account ? <span className="hidden text-xs font-semibold sm:inline">{account.slice(0, 6)}...{account.slice(-4)}</span> : <button onClick={connectWallet} className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-xs font-bold text-white"><Wallet size={15} />Connect Wallet</button>}
            <button onClick={load} disabled={loading} title="Refresh staking data" className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
          </div>
        </header>
        <div className="p-5 sm:p-7 lg:p-8"><div className="mx-auto max-w-6xl">
          {error && <Notice tone="error" text={error} />}
          {status && <Notice text={status} />}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric title="Wallet BANK" value={walletBalance} />
            <Metric title="Your stake" value={stakedBalance} />
            <Metric title="Earned rewards" value={earned} />
            <Metric title="Reward reserve" value={rewardReserve} />
            <Metric title="Reward budget" value={rewardBudgetCap} />
          </div>
          <section className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6">
            <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Coins size={19} /></div><div><h2 className="text-lg font-extrabold">BANK staking</h2><p className="text-xs text-gray-400">Funded emission: {ethers.formatEther(rewardRatePerDay)} BANK/day through {periodFinish ? new Date(Number(periodFinish) * 1000).toLocaleDateString() : "—"}. No additional minting.</p></div></div>
            {!account ? <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-xs text-gray-500"><Wallet size={16} />Connect a wallet to manage your stake.</div> : <>
              <label className="block text-xs font-semibold text-gray-600">Amount (BANK)
                <input type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3" />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => transact("stake")} disabled={submitting || !amount || Number(amount) <= 0 || walletBalance === 0n} className="rounded-lg bg-[#6558d9] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{submitting ? "Processing..." : "Stake BANK"}</button>
                <button onClick={() => transact("unstake")} disabled={submitting || !amount || Number(amount) <= 0 || stakedBalance === 0n} className="rounded-lg border border-gray-200 px-5 py-3 text-xs font-bold text-gray-600 disabled:opacity-50">Unstake BANK</button>
                <button onClick={() => transact("claim")} disabled={submitting || earned === 0n} className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700 disabled:opacity-50">Claim rewards</button>
              </div>
            </>}
          </section>
          <div className="mt-4 rounded-xl bg-white p-4 text-xs text-gray-500">Total staked: {ethers.formatEther(totalStaked)} BANK · Cumulative rewards cannot exceed the on-chain budget cap.</div>
        </div></div>
      </main>
    </div>
  );
}

function Metric({ title, value }) {
  return <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p><p className="mt-2 break-all text-xl font-extrabold">{Number(ethers.formatEther(value)).toLocaleString(undefined, { maximumFractionDigits: 4 })} BANK</p></div>;
}

function Notice({ tone = "success", text }) {
  return <div className={`mb-4 rounded-xl border p-3 text-xs ${tone === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>{text}</div>;
}
import { getWalletProvider } from "../config/wallet";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Check, Clock3, RefreshCw, Vote, Wallet } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getDeployment } from "../config/contract";
import {
  AMM_ABI,
  GOVERNANCE_ABI,
  LOAN_MANAGER_ABI,
  STAKING_ABI,
  TOKEN_ABI,
} from "../config/ProtocolABIs";

const VOTING_STATES = ["Unknown", "Active", "Queued", "Defeated", "Succeeded", "Executed"];

export default function Governance() {
  const [account, setAccount] = useState("");
  const [deployment, setDeployment] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [votingPower, setVotingPower] = useState(0n);
  const [eligibleSupply, setEligibleSupply] = useState(0n);
  const [proposalThreshold, setProposalThreshold] = useState(0n);
  const [minimumVotingBalance, setMinimumVotingBalance] = useState(0n);
  const [quorumBps, setQuorumBps] = useState(0n);
  const [votingPeriod, setVotingPeriod] = useState(0n);
  const [executionDelay, setExecutionDelay] = useState(0n);
  const [loanCaps, setLoanCaps] = useState({ amount: 0n, interestBps: 0n, term: 0n });
  const [maximumRewardDuration, setMaximumRewardDuration] = useState(0n);
  const [currentFeeBps, setCurrentFeeBps] = useState(0n);
  const [maximumFeeBps, setMaximumFeeBps] = useState(0n);
  const [actionType, setActionType] = useState("loan");
  const [requestId, setRequestId] = useState("");
  const [maxLoan, setMaxLoan] = useState("");
  const [interestPercent, setInterestPercent] = useState("");
  const [termDays, setTermDays] = useState("");
  const [rewardDays, setRewardDays] = useState("");
  const [nextFeeBps, setNextFeeBps] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!getWalletProvider()) {
      setError("No wallet provider is available. Connect with WalletConnect or install a browser wallet.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const network = await provider.getNetwork();
      const accounts = await provider.send("eth_accounts", []);
      const wallet = accounts[0] || "";
      setAccount(wallet);

      const activeDeployment = getDeployment(network.chainId);
      if (!activeDeployment?.BankXGovernance || !activeDeployment?.BankXToken || !activeDeployment?.BankXLoanManager || !activeDeployment?.BankXStaking) {
        throw new Error(`BankX governance is not deployed on chain ${network.chainId.toString()}.`);
      }
      for (const name of ["BankXGovernance", "BankXToken", "BankXLoanManager", "BankXStaking"]) {
        if ((await provider.getCode(activeDeployment[name])) === "0x") {
          throw new Error(`${name} has no deployed code on this network.`);
        }
      }

      setDeployment(activeDeployment);

      const governance = new ethers.Contract(activeDeployment.BankXGovernance, GOVERNANCE_ABI, provider);
      const token = new ethers.Contract(activeDeployment.BankXToken, TOKEN_ABI, provider);
      const manager = new ethers.Contract(activeDeployment.BankXLoanManager, LOAN_MANAGER_ABI, provider);
      const staking = new ethers.Contract(activeDeployment.BankXStaking, STAKING_ABI, provider);
      const amm = new ethers.Contract(activeDeployment.BankXAMM, AMM_ABI, provider);
      const count = Number(await governance.proposalCount());
      const [threshold, minimumBalance, quorumValue, period, delay, currentMaxLoan, currentInterest, currentTerm, maxAmount, maxInterest, maxTerm, maxRewardDuration, rewardFinish, fee, maxFee] = await Promise.all([
        governance.PROPOSAL_THRESHOLD(), token.MIN_GOVERNANCE_BALANCE(), governance.QUORUM_BPS(),
        governance.VOTING_PERIOD(), governance.EXECUTION_DELAY(), manager.maxLoanAmount(),
        manager.interestBps(), manager.loanTerm(), manager.MAX_LOAN_AMOUNT(),
        manager.MAX_INTEREST_BPS(), manager.MAX_LOAN_TERM(), staking.INITIAL_REWARD_DURATION(),
        staking.periodFinish(),
        amm.feeBps(),
        amm.MAX_FEE_BPS(),
      ]);
      setProposalThreshold(threshold);
      setMinimumVotingBalance(minimumBalance);
      setQuorumBps(quorumValue);
      setVotingPeriod(period);
      setExecutionDelay(delay);
      setLoanCaps({ amount: maxAmount, interestBps: maxInterest, term: maxTerm });
      setMaximumRewardDuration(maxRewardDuration);
      setCurrentFeeBps(fee);
      setMaximumFeeBps(maxFee);
      setMaxLoan(ethers.formatEther(currentMaxLoan));
      setInterestPercent((Number(currentInterest) / 100).toString());
      setTermDays((Number(currentTerm) / 86400).toString());
      setRewardDays(Math.max(1, Math.ceil((Number(rewardFinish) - Math.floor(Date.now() / 1000)) / 86400)).toString());
      const startBlock = Number(activeDeployment.deploymentBlock || 0);
      const events = await governance.queryFilter(
        governance.filters.ProposalCreated(),
        startBlock,
        "latest",
      );
      const ids = [...new Set(events.map((event) => Number(event.args.proposalId)))].slice(-50).reverse();
      const rows = await Promise.all(ids.map(async (id) => {
        const data = await governance.getProposal(id);
        const state = Number(await governance.state(id));
        const voted = wallet ? await governance.hasVoted(id, wallet) : false;
        return {
          id,
          proposer: data.proposer,
          snapshotBlock: Number(data.snapshotBlock),
          deadline: Number(data.deadline),
          executeAfter: Number(data.executeAfter),
          forVotes: data.forVotes,
          againstVotes: data.againstVotes,
          description: data.description,
          state,
          voted,
        };
      }));

      setProposals(rows);
      if (wallet) {
        setVotingPower(await token.getVotes(wallet));
      } else {
        setVotingPower(0n);
      }
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock > 0) {
        setEligibleSupply(await token.getPastTotalSupply(currentBlock - 1));
      }
      if (count === 0) setProposals([]);
    } catch (loadError) {
      setError(loadError.shortMessage || loadError.message || "Unable to load governance data.");
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [load]);

  const createProposal = async (event) => {
    event.preventDefault();
    if (!account || !deployment) return;
    setSubmitting(true);
    setError("");
    setStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const governance = new ethers.Contract(deployment.BankXGovernance, GOVERNANCE_ABI, signer);
      let target;
      let data;

      if (actionType === "loan" || actionType === "reject-loan") {
        if (!requestId || !/^\d+$/.test(requestId)) throw new Error("Enter a valid pending loan request ID.");
        const manager = new ethers.Interface(LOAN_MANAGER_ABI);
        target = deployment.BankXLoanManager;
        data = manager.encodeFunctionData(actionType === "loan" ? "approveRequest" : "rejectRequest", [requestId]);
      } else if (actionType === "loan-parameters") {
        const manager = new ethers.Interface(LOAN_MANAGER_ABI);
        target = deployment.BankXLoanManager;
        data = manager.encodeFunctionData("setLoanParameters", [
          ethers.parseEther(maxLoan),
          Math.round(Number(interestPercent) * 100),
          Math.round(Number(termDays) * 24 * 60 * 60),
        ]);
      } else if (actionType === "rewards") {
        const staking = new ethers.Interface(STAKING_ABI);
        target = deployment.BankXStaking;
        data = staking.encodeFunctionData("rescheduleRemainingRewards", [
          Math.round(Number(rewardDays) * 24 * 60 * 60),
        ]);
      } else {
        const amm = new ethers.Interface(AMM_ABI);
        target = deployment.BankXAMM;
        data = amm.encodeFunctionData("setFeeBps", [Number(nextFeeBps)]);
      }

      const tx = await governance.propose([target], [data], description.trim());
      setStatus(`Proposal submitted: ${tx.hash}`);
      await tx.wait();
      setDescription("");
      setRequestId("");
      setStatus("Proposal created and voting is open.");
      await load();
    } catch (proposalError) {
      setError(proposalError.shortMessage || proposalError.reason || proposalError.message || "Proposal failed.");
      setStatus("");
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (proposalId, support) => {
    if (!deployment) return;
    setSubmitting(true);
    setError("");
    setStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const governance = new ethers.Contract(deployment.BankXGovernance, GOVERNANCE_ABI, signer);
      const tx = await governance.castVote(proposalId, support);
      setStatus(`Vote submitted: ${tx.hash}`);
      await tx.wait();
      setStatus("Vote confirmed.");
      await load();
    } catch (voteError) {
      setError(voteError.shortMessage || voteError.reason || voteError.message || "Vote failed.");
      setStatus("");
    } finally {
      setSubmitting(false);
    }
  };

  const execute = async (proposalId) => {
    if (!deployment) return;
    setSubmitting(true);
    setError("");
    setStatus("Awaiting wallet confirmation...");
    try {
      const provider = new ethers.BrowserProvider(getWalletProvider());
      const signer = await provider.getSigner();
      const governance = new ethers.Contract(deployment.BankXGovernance, GOVERNANCE_ABI, signer);
      const tx = await governance.execute(proposalId);
      setStatus(`Execution submitted: ${tx.hash}`);
      await tx.wait();
      setStatus("Proposal executed.");
      await load();
    } catch (executeError) {
      setError(executeError.shortMessage || executeError.reason || executeError.message || "Execution failed.");
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
          <div>
            <h1 className="text-2xl font-extrabold">Governance</h1>
            <p className="mt-1 text-xs text-gray-400">BankX proposals and voting</p>
          </div>
          <div className="flex items-center gap-3">
            {account ? <span className="hidden text-xs font-semibold sm:inline">{account.slice(0, 6)}...{account.slice(-4)}</span> : <button onClick={connectWallet} className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-xs font-bold text-white"><Wallet size={15} />Connect Wallet</button>}
            <button onClick={load} disabled={loading} title="Refresh governance" className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 disabled:opacity-50">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {error && <Notice tone="error" text={error} />}
            {status && <Notice text={status} />}

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric title="Voting power" value={ethers.formatEther(votingPower)} suffix="BANK" />
              <Metric title="Eligible voting supply" value={ethers.formatEther(eligibleSupply)} suffix="BANK" />
              <Metric title="Proposal threshold" value={ethers.formatEther(proposalThreshold)} suffix="BANK" />
            </div>

            {account && deployment && (
              <form onSubmit={createProposal} className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><Vote size={19} /></div>
                  <div><h2 className="text-lg font-extrabold">Create proposal</h2><p className="text-xs text-gray-400">Requires at least {ethers.formatEther(proposalThreshold)} eligible BANK at the prior-block snapshot.</p></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-semibold text-gray-600">Action
                    <select value={actionType} onChange={(event) => setActionType(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3">
                      <option value="loan">Approve pending loan request</option>
                      <option value="reject-loan">Reject pending loan request</option>
                      <option value="loan-parameters">Update loan parameters</option>
                      <option value="rewards">Reschedule remaining staking rewards</option>
                      <option value="amm-fee">Reduce AMM swap fee</option>
                    </select>
                  </label>
                  {(actionType === "loan" || actionType === "reject-loan") && <label className="text-xs font-semibold text-gray-600">Loan request ID
                    <input required inputMode="numeric" value={requestId} onChange={(event) => setRequestId(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                  </label>}
                  {actionType === "loan-parameters" && <>
                    <label className="text-xs font-semibold text-gray-600">Maximum loan (ETH)
                      <input required type="number" min="0.000001" max={ethers.formatEther(loanCaps.amount)} step="0.000001" value={maxLoan} onChange={(event) => setMaxLoan(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">Simple interest per term (%)
                      <input required type="number" min="0" max={Number(loanCaps.interestBps) / 100} step="0.01" value={interestPercent} onChange={(event) => setInterestPercent(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">Term (days)
                      <input required type="number" min="1" max={Number(loanCaps.term) / 86400} step="1" value={termDays} onChange={(event) => setTermDays(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                    </label>
                  </>}
                  {actionType === "rewards" && <label className="text-xs font-semibold text-gray-600">Remaining schedule duration (days)
                    <input required type="number" min="1" max={Number(maximumRewardDuration) / 86400} step="1" value={rewardDays} onChange={(event) => setRewardDays(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                  </label>}
                  {actionType === "amm-fee" && <label className="text-xs font-semibold text-gray-600">New swap fee (basis points), current {currentFeeBps.toString()} bps
                    <input required type="number" min="0" max={Number(maximumFeeBps)} step="1" value={nextFeeBps} onChange={(event) => setNextFeeBps(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                  </label>}
                  <label className="text-xs font-semibold text-gray-600 md:col-span-2">Proposal description
                    <input required minLength="8" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3" />
                  </label>
                </div>
                <button type="submit" disabled={submitting || votingPower < proposalThreshold} className="mt-5 rounded-xl bg-[#6558d9] px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? "Processing..." : "Submit proposal"}
                </button>
                {votingPower < proposalThreshold && <p className="mt-2 text-xs text-gray-400">This wallet does not currently meet the {ethers.formatEther(minimumVotingBalance)} BANK threshold.</p>}
              </form>
            )}

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div><p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">Governance</p><h2 className="mt-1 text-xl font-extrabold">Proposals</h2></div>
                <span className="text-xs text-gray-400">{Math.round(Number(votingPeriod) / 86400)}-day vote · {Number(quorumBps) / 100}% quorum · {Math.round(Number(executionDelay) / 3600)}-hour delay</span>
              </div>
              {loading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400">Loading proposals...</div> : proposals.length === 0 ? <div className="rounded-2xl border border-[#e9e9f0] bg-white p-8 text-center text-sm text-gray-400">No proposals found on this deployment.</div> : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <article key={proposal.id} className="rounded-2xl border border-[#e9e9f0] bg-white p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="text-[10px] font-semibold uppercase text-violet-500">Proposal #{proposal.id}</p><h3 className="mt-1 text-base font-extrabold">{proposal.description}</h3><p className="mt-1 text-[10px] text-gray-400">Snapshot block {proposal.snapshotBlock} · proposer {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</p></div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-600">{VOTING_STATES[proposal.state]}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-5 text-xs text-gray-500">
                        <span>For: {ethers.formatEther(proposal.forVotes)} BANK</span>
                        <span>Against: {ethers.formatEther(proposal.againstVotes)} BANK</span>
                        <span>Voting ends: {new Date(proposal.deadline * 1000).toLocaleString()}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {proposal.state === 1 && account && !proposal.voted && <>
                          <button onClick={() => vote(proposal.id, true)} disabled={submitting || votingPower < minimumVotingBalance} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><Check size={14} />Vote For</button>
                          <button onClick={() => vote(proposal.id, false)} disabled={submitting || votingPower < minimumVotingBalance} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 disabled:opacity-50">Vote Against</button>
                        </>}
                        {proposal.state === 4 && <button onClick={() => execute(proposal.id)} disabled={submitting} className="flex items-center gap-2 rounded-lg bg-[#6558d9] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><Clock3 size={14} />Execute</button>}
                        {proposal.voted && <span className="self-center text-xs text-gray-400">Vote recorded</span>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Metric({ title, value, suffix }) {
  return <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p><p className="mt-2 break-all text-lg font-extrabold">{Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xs text-gray-400">{suffix}</span></p></div>;
}

function Notice({ tone = "success", text }) {
  const style = tone === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700";
  return <div className={`mb-4 rounded-xl border p-3 text-xs ${style}`}>{text}</div>;
}
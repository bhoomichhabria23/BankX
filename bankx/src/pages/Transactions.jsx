import { getWalletProvider } from "../config/wallet";
import {
  Activity,
  Search,
  Wallet,
  RefreshCw,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
} from "lucide-react";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Sidebar from "../components/Sidebar";
import { BANKX_ABI, getDeployment } from "../config/contract";

const protocolAddressFields = [
  "legacyBankX",
  "BankXToken",
  "BankXSavingsVault",
  "BankXAMM",
  "BankXStaking",
  "BankXLoanManager",
  "BankXGovernance",
  "BankXPriceFeed",
  "BankXUsdcVault",
  "usdc",
];

const bankXInterface = new ethers.Interface(BANKX_ABI);

function getAddress(value) {
  return typeof value === "string"
    ? value.toLowerCase()
    : value?.hash?.toLowerCase() || "";
}

async function fetchAllIndexerPages(indexerUrl, walletAddress, resource) {
  const firstPageUrl =
    `${indexerUrl}/addresses/${encodeURIComponent(walletAddress)}/${resource}`;
  let pageUrl = firstPageUrl;
  const visitedPages = new Set();
  const items = [];

  while (pageUrl && !visitedPages.has(pageUrl)) {
    visitedPages.add(pageUrl);
    const response = await fetch(pageUrl);

    if (!response.ok) {
      throw new Error(
        `The transaction indexer returned HTTP ${response.status} while loading ${resource}.`
      );
    }

    const page = await response.json();

    if (!Array.isArray(page.items)) {
      throw new Error(`The transaction indexer returned invalid ${resource} data.`);
    }

    items.push(...page.items);

    if (!page.next_page_params) {
      pageUrl = "";
      continue;
    }

    const nextPage = new URL(firstPageUrl);
    Object.entries(page.next_page_params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        nextPage.searchParams.set(key, String(value));
      }
    });
    pageUrl = nextPage.toString();
  }

  if (pageUrl) {
    throw new Error(`The transaction indexer returned a repeated ${resource} page.`);
  }

  return items;
}

function formatTokenAmount(value, decimals) {
  const formatted = ethers.formatUnits(BigInt(value), decimals);
  return formatted.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
}

export default function Transactions() {
  const [wallet, setWallet] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     LOAD TRANSACTIONS
  ===================================================== */

  const loadTransactions = async () => {
    try {
      setError("");
      setLoading(true);

      if (!getWalletProvider()) {
        setError("No wallet provider is available. Connect with WalletConnect or install a browser wallet.");
        return;
      }

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      /* =================================================
         NETWORK
      ================================================= */

      const networkInfo =
        await provider.getNetwork();

      console.log(
        "Connected chain:",
        networkInfo.chainId.toString()
      );

      const accounts = await provider.send("eth_accounts", []);
      const userAddress = accounts[0] || "";
      setWallet(userAddress);
      if (!userAddress) {
        setTransactions([]);
        return;
      }

      const deployment = getDeployment(networkInfo.chainId);
      if (!deployment) {
        setError(`BankX is not configured for chain ${networkInfo.chainId.toString()}.`);
        return;
      }
      setNetwork(deployment.chainName || `Chain ${networkInfo.chainId.toString()}`);
      const indexerUrl = deployment.transactionIndexerUrl?.replace(/\/+$/, "");
      if (!indexerUrl) {
        setError(
          `Full transaction history is not available for ${deployment.chainName || `chain ${networkInfo.chainId.toString()}`}.`
        );
        return;
      }
      setExplorerUrl(indexerUrl.replace(/\/api\/v\d+\/?$/, ""));

      const [indexedTransactions, indexedTokenTransfers] = await Promise.all([
        fetchAllIndexerPages(indexerUrl, userAddress, "transactions"),
        fetchAllIndexerPages(indexerUrl, userAddress, "token-transfers"),
      ]);

      const protocolAddresses = new Set(
        protocolAddressFields
          .map((field) => deployment[field])
          .filter((address) => typeof address === "string" && ethers.isAddress(address))
          .map((address) => address.toLowerCase())
      );
      const tokenAddresses = new Set(
        [
          deployment.BankXToken,
          deployment.usdc,
          deployment.BankXSavingsVault,
          deployment.BankXUsdcVault,
        ]
          .filter((address) => typeof address === "string" && ethers.isAddress(address))
          .map((address) => address.toLowerCase())
      );

      const transfersByHash = new Map();
      const firstTransferByHash = new Map();
      indexedTokenTransfers
        .filter((transfer) => tokenAddresses.has(getAddress(transfer.token?.address_hash)))
        .forEach((transfer) => {
          const hash = transfer.transaction_hash?.toLowerCase();
          if (!hash) return;

          if (!firstTransferByHash.has(hash)) {
            firstTransferByHash.set(hash, transfer);
          }
          const tokenAddress = getAddress(transfer.token?.address_hash);
          const transferDecimals = Number(transfer.total?.decimals);
          const decimals = Number.isInteger(transferDecimals) && transferDecimals >= 0
            ? transferDecimals
            : tokenAddress === deployment.usdc?.toLowerCase()
              ? Number(deployment.usdcDecimals) || 6
              : 18;
          const amount = BigInt(transfer.total?.value || "0");
          const transferFrom = getAddress(transfer.from);
          const transferTo = getAddress(transfer.to);
          const signedAmount =
            transferFrom === userAddress.toLowerCase()
              ? -amount
              : transferTo === userAddress.toLowerCase()
                ? amount
                : 0n;

          if (!transfersByHash.has(hash)) {
            transfersByHash.set(hash, new Map());
          }
          const amountsByToken = transfersByHash.get(hash);
          const current = amountsByToken.get(tokenAddress) || {
            amount: 0n,
            decimals,
            symbol: transfer.token?.symbol ||
              (tokenAddress === deployment.usdc?.toLowerCase()
                ? "USDC"
                : tokenAddress === deployment.BankXSavingsVault?.toLowerCase()
                  ? "bxBANK"
                  : tokenAddress === deployment.BankXUsdcVault?.toLowerCase()
                    ? "bxUSDC"
                    : "BANKX"),
          };
          current.amount += signedAmount;
          amountsByToken.set(tokenAddress, current);
        });

      const transactionsByHash = new Map();
      indexedTransactions.forEach((tx) => {
        const from = getAddress(tx.from);
        const to = getAddress(tx.to);
        if (!protocolAddresses.has(from) && !protocolAddresses.has(to)) return;
        if (tx.hash) transactionsByHash.set(tx.hash.toLowerCase(), tx);
      });

      transfersByHash.forEach((_amounts, hash) => {
        if (transactionsByHash.has(hash)) return;
        const transfer = firstTransferByHash.get(hash);
        if (!transfer) return;
        transactionsByHash.set(hash, {
          hash,
          block_number: transfer.block_number,
          timestamp: transfer.timestamp,
          from: transfer.from,
          to: transfer.to,
          value: "0",
          status: "ok",
          result: "success",
        });
      });

      const result = [...transactionsByHash.values()].map((tx) => {
        const hash = tx.hash.toLowerCase();
        const from = getAddress(tx.from);
        const to = getAddress(tx.to);
        const tokenAmounts = transfersByHash.get(hash);
        const tokenAmountLabels = tokenAmounts
          ? [...tokenAmounts.values()]
              .filter((token) => token.amount !== 0n)
              .map((token) => {
                const sign = token.amount > 0n ? "+" : "-";
                return `${sign}${formatTokenAmount(
                  token.amount < 0n ? -token.amount : token.amount,
                  token.decimals
                )} ${token.symbol}`;
              })
          : [];

        let method =
          tx.method ||
          tx.decoded_input?.method_call?.split("(")[0] ||
          "";
        if (!method && to === deployment.legacyBankX?.toLowerCase() && tx.raw_input) {
          method = bankXInterface.parseTransaction({ data: tx.raw_input })?.name || "";
        }

        const parsedTimestamp = tx.timestamp ? Date.parse(tx.timestamp) : 0;
        return {
          hash,
          type: method
            ? method.replace(/([a-z])([A-Z])/g, "$1 $2")
            : tokenAmountLabels.length
              ? `${[...new Set([...tokenAmounts.values()].map((token) => token.symbol))].join("/")} transfer`
              : "BankX Contract Interaction",
          amount: tokenAmountLabels.length
            ? tokenAmountLabels.join(", ")
            : `${ethers.formatEther(BigInt(tx.value || "0"))} ETH`,
          from,
          to,
          blockNumber: Number(tx.block_number),
          timestamp: Number.isNaN(parsedTimestamp)
            ? 0
            : Math.floor(parsedTimestamp / 1000),
          status:
            tx.status === "ok" ||
            tx.status === "success" ||
            tx.result === "success"
              ? "Confirmed"
              : "Failed",
          direction: from === userAddress.toLowerCase() ? "out" : "in",
        };
      });

      result.sort((a, b) => b.blockNumber - a.blockNumber);
      setTransactions(result);
    } catch (err) {
      console.error(
        "Transaction loading error:",
        err
      );

      setError(
        err?.shortMessage ||
          err?.message ||
          "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadTransactions(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* =====================================================
     WALLET EVENTS
  ===================================================== */

  useEffect(() => {
    if (!getWalletProvider()) return;

    const accountsChanged = () => {
      loadTransactions();
    };

    const chainChanged = () => {
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
     SEARCH
  ===================================================== */

  const filteredTransactions =
    transactions.filter((tx) => {
      const query =
        search.toLowerCase();

      return (
        tx.hash
          .toLowerCase()
          .includes(query) ||
        tx.type
          .toLowerCase()
          .includes(query) ||
        tx.amount
          .includes(query)
      );
    });

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">

      <Sidebar />

      <main className="min-h-screen lg:ml-[245px]">

        {/* HEADER */}

        <header className="border-b border-[#e9e9f0] bg-white px-6 py-5 lg:px-8">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-extrabold">
                Transactions
              </h1>

              <p className="mt-1 text-sm text-gray-400">
                Your on-chain transaction history
              </p>
            </div>

            <div className="flex items-center gap-3">

              {network && (
                <div className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 sm:flex">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      network === "Sepolia"
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    }`}
                  />

                  <span className="text-[10px] font-bold text-gray-500">
                    {network}
                  </span>

                </div>
              )}

              {!wallet ? (
                <button
                  onClick={async () => {
                    try {
                      await getWalletProvider().request({
                        method:
                          "eth_requestAccounts",
                      });

                      await loadTransactions();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#6558d9] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-indigo-100 hover:bg-[#574ac9]"
                >
                  <Wallet size={15} />
                  Connect Wallet
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
                onClick={loadTransactions}
                disabled={loading}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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

        {/* CONTENT */}

        <div className="p-6 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* TITLE */}

            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">
                  Blockchain activity
                </p>

                <h2 className="mt-1 text-3xl font-extrabold">
                  Transaction history
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Full indexed history of your BankX activity on {network || "the connected network"}.
                </p>

              </div>

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search transaction..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-violet-400 lg:w-[280px]"
                />

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">

                <div className="flex gap-3">

                  <CircleAlert
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div>

                    <p className="text-xs font-bold text-red-700">
                      Unable to load transactions
                    </p>

                    <p className="mt-1 text-[11px] text-red-600">
                      {error}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* STATS */}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">

              <StatCard
                title="Transactions"
                value={
                  transactions.length
                }
              />

              <StatCard
                title="BankX Contract"
                value="Active"
              />

              <StatCard
                title="Network"
                value={network || "—"}
              />

            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-[#e9e9f0] bg-white shadow-sm">

              {loading ? (

                <div className="flex min-h-[330px] items-center justify-center">

                  <div className="text-center">

                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-violet-500"
                    />

                    <p className="mt-4 text-sm font-bold text-gray-500">
                      Reading blockchain...
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Loading indexed BankX history
                    </p>

                  </div>

                </div>

              ) : filteredTransactions.length > 0 ? (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px]">

                    <thead>

                      <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-wider text-gray-400">

                        <th className="px-6 py-5">
                          Transaction
                        </th>

                        <th className="px-6 py-5">
                          Type
                        </th>

                        <th className="px-6 py-5">
                          Amount
                        </th>

                        <th className="px-6 py-5">
                          Status
                        </th>

                        <th className="px-6 py-5">
                          Date
                        </th>

                        <th className="px-6 py-5">
                          Explorer
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredTransactions.map(
                        (tx) => (
                          <TransactionRow
                            key={tx.hash}
                            tx={tx}
                            explorerUrl={explorerUrl}
                          />
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="flex min-h-[330px] items-center justify-center">

                  <div className="max-w-md text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-gray-300">

                      <Activity size={27} />

                    </div>

                    <p className="mt-5 text-base font-bold text-gray-400">

                      {wallet
                        ? "No transactions found"
                        : "Connect your wallet"}

                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-400">

                      {wallet
                        ? `No BankX transactions were found for this wallet on ${network || "the connected network"}.`
                        : "Connect your wallet to view your transactions."}

                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f0] bg-white p-5 shadow-sm">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-extrabold">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   TRANSACTION ROW
===================================================== */

function TransactionRow({
  tx,
  explorerUrl,
}) {
  const isIncoming =
    tx.direction === "in";

  const date = tx.timestamp
    ? new Date(
        tx.timestamp * 1000
      ).toLocaleString()
    : "Unknown";

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50">

      {/* HASH */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isIncoming
                ? "bg-emerald-50 text-emerald-600"
                : "bg-violet-50 text-violet-600"
            }`}
          >

            {isIncoming ? (
              <ArrowDownLeft size={16} />
            ) : (
              <ArrowUpRight size={16} />
            )}

          </div>

          <div>

            <p className="font-mono text-xs font-bold">
              {tx.hash.slice(0, 8)}
              ...
              {tx.hash.slice(-6)}
            </p>

            <p className="mt-1 text-[9px] text-gray-400">
              Block #{tx.blockNumber}
            </p>

          </div>

        </div>

      </td>

      {/* TYPE */}

      <td className="px-6 py-5">

        <span className="rounded-full bg-violet-50 px-3 py-1 text-[9px] font-bold text-violet-600">
          {tx.type}
        </span>

      </td>

      {/* AMOUNT */}

      <td className="px-6 py-5">

        <span className="text-sm font-extrabold">
          {tx.amount} ETH
        </span>

      </td>

      {/* STATUS */}

      <td className="px-6 py-5">

        {tx.status === "Confirmed" ? (
          <div className="flex items-center gap-2">

            <CircleCheck
              size={14}
              className="text-emerald-500"
            />

            <span className="text-[10px] font-bold text-emerald-600">
              Confirmed
            </span>

          </div>
        ) : (
          <span className="text-[10px] font-bold text-red-500">
            Failed
          </span>
        )}

      </td>

      {/* DATE */}

      <td className="px-6 py-5">

        <span className="text-xs text-gray-500">
          {date}
        </span>

      </td>

      {/* EXPLORER */}

      <td className="px-6 py-5">

        <a
          href={`${explorerUrl}/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-2 text-[10px] font-bold text-violet-600 hover:bg-violet-50"
        >
          View
          <ExternalLink size={12} />
        </a>

      </td>

    </tr>
  );
}
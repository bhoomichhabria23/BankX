import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { Activity, Clock3, RefreshCw } from "lucide-react";

import Sidebar from "../components/Sidebar";
import { getDeployment } from "../config/contract";

const SEPOLIA_CHAIN_ID = 11155111n;
const DEFAULT_ETH_USD_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const FEED_ABI = [
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
];
const SAFE_ERROR_MESSAGES = new Set([
  "Configure VITE_SEPOLIA_RPC_URL with a public read-only Sepolia RPC URL.",
  "The configured ETH/USD feed address is invalid.",
  "VITE_CHAINLINK_MAX_AGE_SECONDS must be a positive whole number.",
  "The configured RPC URL is not connected to Ethereum Sepolia.",
  "The ETH/USD feed returned an invalid price.",
  "The ETH/USD feed returned an invalid update time.",
  "The ETH/USD price is stale.",
]);

function getFeedConfig() {
  const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL?.trim();
  const deployment = getDeployment(SEPOLIA_CHAIN_ID);
  const feedAddress =
    import.meta.env.VITE_CHAINLINK_ETH_USD_FEED_ADDRESS?.trim() ||
    deployment?.ethUsdFeed ||
    DEFAULT_ETH_USD_FEED;
  const maxAgeValue = import.meta.env.VITE_CHAINLINK_MAX_AGE_SECONDS?.trim();
  const maxAgeSeconds = maxAgeValue ? Number(maxAgeValue) : 3600;

  if (!rpcUrl) {
    throw new Error("Configure VITE_SEPOLIA_RPC_URL with a public read-only Sepolia RPC URL.");
  }
  if (!ethers.isAddress(feedAddress)) {
    throw new Error("The configured ETH/USD feed address is invalid.");
  }
  if (!Number.isSafeInteger(maxAgeSeconds) || maxAgeSeconds <= 0) {
    throw new Error("VITE_CHAINLINK_MAX_AGE_SECONDS must be a positive whole number.");
  }

  return { rpcUrl, feedAddress, maxAgeSeconds };
}

export default function ChainlinkPriceFeed() {
  const [price, setPrice] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [nowSeconds, setNowSeconds] = useState(() => BigInt(Math.floor(Date.now() / 1000)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadPrice = async () => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const { rpcUrl, feedAddress, maxAgeSeconds } = getFeedConfig();
      const provider = new ethers.JsonRpcProvider(rpcUrl, Number(SEPOLIA_CHAIN_ID));
      const network = await provider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        throw new Error("The configured RPC URL is not connected to Ethereum Sepolia.");
      }

      const feed = new ethers.Contract(feedAddress, FEED_ABI, provider);
      const [decimals, roundData] = await Promise.all([
        feed.decimals(),
        feed.latestRoundData(),
      ]);
      const [roundId, answer, , feedUpdatedAt, answeredInRound] = roundData;

      if (answer <= 0n || roundId === 0n || answeredInRound < roundId) {
        throw new Error("The ETH/USD feed returned an invalid price.");
      }

      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      if (feedUpdatedAt === 0n || feedUpdatedAt > currentTime) {
        throw new Error("The ETH/USD feed returned an invalid update time.");
      }
      if (currentTime - feedUpdatedAt > BigInt(maxAgeSeconds)) {
        throw new Error("The ETH/USD price is stale.");
      }

      const formattedPrice = ethers.formatUnits(answer, decimals);
      if (currentRequestId === requestId.current) {
        setPrice(formattedPrice);
        setUpdatedAt(feedUpdatedAt);
        setNowSeconds(currentTime);
      }
    } catch (requestError) {
      if (currentRequestId === requestId.current) {
        setPrice("");
        setUpdatedAt(null);
        setError(
          SAFE_ERROR_MESSAGES.has(requestError?.message)
            ? requestError.message
            : "Price unavailable. Check the public Sepolia RPC configuration and try again.",
        );
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadPrice();
    }, 0);
    const timer = window.setInterval(() => {
      setNowSeconds(BigInt(Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => {
      requestId.current += 1;
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, []);

  const secondsAgo =
    updatedAt === null
      ? null
      : (nowSeconds - updatedAt).toString();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">
      <Sidebar />
      <main className="min-h-screen lg:ml-[245px]">
        <header className="border-b border-[#e9e9f0] bg-white px-6 py-5 lg:px-8">
          <h1 className="text-2xl font-extrabold">Chainlink Price Feed</h1>
          <p className="mt-1 text-sm text-gray-400">
            Live ETH/USD price from the Ethereum Sepolia testnet
          </p>
        </header>

        <div className="p-6 lg:p-8">
          <section className="mx-auto max-w-5xl rounded-2xl border border-[#e9e9f0] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Activity size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">ETH / USD</h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Ethereum Sepolia
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Chainlink Data Feeds · Read-only public RPC
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPrice}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6255d5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5145c4] disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing…" : "Refresh Price"}
              </button>
            </div>

            <div className="mt-8 rounded-xl bg-[#f8f7ff] p-5 sm:p-7">
              <p className="text-sm font-medium text-gray-500">Live price</p>
              {loading && !price ? (
                <p className="mt-3 text-3xl font-extrabold text-[#39345f]" aria-live="polite">
                  Loading price…
                </p>
              ) : price ? (
                <p className="mt-3 break-words text-4xl font-extrabold tracking-tight text-[#211d4f] sm:text-5xl">
                  ${Number(price).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              ) : (
                <p className="mt-3 text-3xl font-extrabold text-[#39345f]">Price unavailable</p>
              )}

              {error && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Clock3 size={16} />
                <span>
                  {secondsAgo === null
                    ? "Last updated: —"
                    : `Last updated: ${secondsAgo} seconds ago`}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e9e9f0] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Feed network</p>
                <p className="mt-2 text-sm font-semibold text-[#39345f]">Ethereum Sepolia</p>
              </div>
              <div className="rounded-xl border border-[#e9e9f0] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Feed pair</p>
                <p className="mt-2 text-sm font-semibold text-[#39345f]">ETH / USD</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

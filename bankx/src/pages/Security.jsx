import {
  disconnectWalletConnect,
  getWalletProvider,
  isWalletConnectActive,
  walletConnectConfigured,
} from "../config/wallet";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

function getNetworkName(chainId) {
  const networks = {
    "0x1": "Ethereum Mainnet",
    "0xaa36a7": "Sepolia",
    "0x7a69": "Localhost",
  };

  return networks[chainId?.toLowerCase()] || (
    chainId ? `Chain ${Number.parseInt(chainId, 16)}` : "Unknown network"
  );
}

export default function Security() {
  const [walletAvailable] = useState(
    () => Boolean(getWalletProvider()) || walletConnectConfigured,
  );
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const provider = getWalletProvider();
    if (!provider) return undefined;

    const refreshWallet = async () => {
      try {
        const [accounts, currentChainId] = await Promise.all([
          provider.request({ method: "eth_accounts" }),
          provider.request({ method: "eth_chainId" }),
        ]);
        setAccount(accounts[0] || "");
        setChainId(currentChainId);
        setError("");
      } catch (requestError) {
        setError(requestError?.message || "Could not read wallet security details.");
      }
    };

    const handleAccountsChanged = (accounts) => setAccount(accounts[0] || "");
    const handleChainChanged = (currentChainId) => setChainId(currentChainId);

    void refreshWallet();
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    setBusy(true);
    setError("");
    try {
      if (!getWalletProvider()) {
        throw new Error("Install a browser wallet such as MetaMask to connect.");
      }
      const accounts = await getWalletProvider().request({
        method: "eth_requestAccounts",
      });
      const currentChainId = await getWalletProvider().request({
        method: "eth_chainId",
      });
      setAccount(accounts[0] || "");
      setChainId(currentChainId);
    } catch (requestError) {
      setError(requestError?.message || "The wallet could not be connected.");
    } finally {
      setBusy(false);
    }
  };

  const disconnectWallet = async () => {
    setBusy(true);
    setError("");
    try {
      if (isWalletConnectActive()) {
        await disconnectWalletConnect();
        window.location.reload();
        return;
      }

      await getWalletProvider().request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      setAccount("");
    } catch (requestError) {
      setError(
        requestError?.message ||
          "The wallet could not revoke this site's account access."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">
      <Sidebar />
      <main className="min-h-screen lg:ml-[245px]">
        <header className="border-b border-[#e9e9f0] bg-white px-6 py-5 lg:px-8">
          <h1 className="text-2xl font-extrabold">Security</h1>
          <p className="mt-1 text-sm text-gray-400">
            Review your wallet connection and protect your assets
          </p>
        </header>

        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-2xl border border-[#e9e9f0] bg-white p-6 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Wallet size={23} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Wallet connection</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      BankX uses your browser wallet to approve blockchain actions.
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${
                  account ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {account ? <CheckCircle2 size={14} /> : <LockKeyhole size={14} />}
                  {account ? "Connected" : "Not connected"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8f8fc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Wallet address</p>
                  <p className="mt-2 break-all font-mono text-sm text-[#202238]">
                    {account || "No wallet account authorized"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8f8fc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Network</p>
                  <p className="mt-2 text-sm font-semibold text-[#202238]">
                    {account ? getNetworkName(chainId) : "Connect a wallet to view"}
                  </p>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {account ? (
                  <button
                    type="button"
                    onClick={disconnectWallet}
                    disabled={busy}
                    className="rounded-lg border border-[#e1e1eb] px-4 py-2.5 text-sm font-semibold text-[#39345f] transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {busy ? "Updating..." : "Revoke wallet access"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={connectWallet}
                    disabled={busy || !walletAvailable}
                    className="rounded-lg bg-[#6255d5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5144c2] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Connecting..." : walletAvailable ? "Connect wallet" : "Wallet not detected"}
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-400">
                Revoking access disconnects this site; it does not remove or transfer assets from your wallet.
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-violet-600" size={22} />
                <h2 className="text-lg font-bold">Stay safe</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <SafetyTip
                  icon={KeyRound}
                  title="Keep your recovery phrase private"
                  detail="BankX will never ask for your seed phrase or private keys."
                />
                <SafetyTip
                  icon={Fingerprint}
                  title="Review every signature"
                  detail="Check the wallet prompt and network before approving a transaction."
                />
                <SafetyTip
                  icon={AlertTriangle}
                  title="Verify the site"
                  detail="Only connect your wallet to the official BankX app you intended to visit."
                />
              </div>
              <a
                href="https://support.metamask.io/"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900"
              >
                Wallet safety guidance <ExternalLink size={14} />
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SafetyTip({ icon: Icon, title, detail }) {
  return (
    <div className="rounded-xl bg-[#f8f8fc] p-4">
      <Icon className="text-violet-600" size={19} />
      <h3 className="mt-3 text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
    </div>
  );
}

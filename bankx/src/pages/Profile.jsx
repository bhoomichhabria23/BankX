import { getWalletProvider } from "../config/wallet";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Sidebar from "../components/Sidebar";

export default function Profile() {

  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState("0");
  const [network, setNetwork] = useState("");
  const [copied, setCopied] = useState(false);

  const loadWallet = async () => {

    if (!getWalletProvider()) return;

    try {

      const provider = new ethers.BrowserProvider(
        getWalletProvider()
      );

      const accounts = await provider.send(
        "eth_accounts",
        []
      );

      if (!accounts.length) {
        setWallet("");
        setBalance("0");
        setNetwork("");
        return;
      }

      const address = accounts[0];

      setWallet(address);

      const balanceValue =
        await provider.getBalance(address);

      setBalance(
        Number(
          ethers.formatEther(balanceValue)
        ).toFixed(4)
      );

      const networkData =
        await provider.getNetwork();

      setNetwork(
        getNetworkName(networkData.chainId)
      );

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadWallet(); }, 0);
    if (!getWalletProvider()) return () => window.clearTimeout(timer);
    const accountsChanged = (accounts) => {
      if (!accounts.length) {
        setWallet("");
        setBalance("0");
        setNetwork("");
      } else {
        void loadWallet();
      }
    };
    const chainChanged = () => window.location.reload();
    getWalletProvider().on("accountsChanged", accountsChanged);
    getWalletProvider().on("chainChanged", chainChanged);
    return () => {
      window.clearTimeout(timer);
      getWalletProvider().removeListener("accountsChanged", accountsChanged);
      getWalletProvider().removeListener("chainChanged", chainChanged);
    };
  }, []);

  const copyWallet = async () => {

    if (!wallet) return;

    await navigator.clipboard.writeText(wallet);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const connect = async () => {

    if (!getWalletProvider()) {
      alert("No browser wallet is available. Connect with WalletConnect or install a wallet extension.");
      return;
    }

    try {

      const provider =
        new ethers.BrowserProvider(
          getWalletProvider()
        );

      await provider.send(
        "eth_requestAccounts",
        []
      );

      await loadWallet();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">

      <Sidebar />

      <main className="min-h-screen lg:ml-[245px]">

        <header className="border-b border-[#e9e9f0] bg-white px-6 py-5 lg:px-8">

          <h1 className="text-2xl font-extrabold">
            Profile
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage your BankX wallet profile
          </p>

        </header>

        <div className="p-6 lg:p-8">

          <div className="mx-auto max-w-5xl">

            {/* PROFILE HEADER */}
            <div className="rounded-2xl border border-[#e9e9f0] bg-white p-7">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Wallet size={35} />
                </div>

                <div>

                  <p className="text-sm text-gray-400">
                    BankX Wallet Profile
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold">
                    {wallet
                      ? `${wallet.slice(
                          0,
                          6
                        )}...${wallet.slice(-4)}`
                      : "Wallet not connected"}
                  </h2>

                  <div className="mt-2 flex items-center gap-2">

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        wallet
                          ? "bg-emerald-400"
                          : "bg-gray-300"
                      }`}
                    />

                    <span className="text-sm text-gray-400">
                      {wallet
                        ? "Wallet connected"
                        : "Not connected"}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* WALLET */}
            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-7">

              <h3 className="text-xl font-extrabold">
                Wallet information
              </h3>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <InfoBox
                  title="Wallet Address"
                  value={
                    wallet || "No wallet connected"
                  }
                  action={
                    wallet ? (
                      <button
                        onClick={copyWallet}
                        className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-gray-100"
                      >
                        {copied ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <Copy size={17} />
                        )}
                      </button>
                    ) : null
                  }
                />

                <InfoBox
                  title="Network"
                  value={
                    network || "Not connected"
                  }
                />

                <InfoBox
                  title="ETH Balance"
                  value={
                    wallet
                      ? `${balance} ETH`
                      : "—"
                  }
                />

                <InfoBox
                  title="Wallet Status"
                  value={
                    wallet
                      ? "Connected"
                      : "Disconnected"
                  }
                />

              </div>

              {!wallet && (
                <button
                  onClick={connect}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-[#6558d9] px-6 py-3 text-sm font-bold text-white"
                >
                  <Wallet size={18} />
                  Connect Wallet
                </button>
              )}

            </div>

            {/* SECURITY */}
            <div className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck size={21} />
                </div>

                <div>

                  <h3 className="text-xl font-extrabold">
                    Wallet security
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    Your wallet remains under your control.
                  </p>

                </div>

              </div>

              <div className="mt-6 rounded-xl bg-emerald-50 p-5">

                <div className="flex gap-3">

                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-emerald-600"
                  />

                  <div>

                    <p className="text-sm font-bold text-emerald-700">
                      Non-custodial wallet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700/70">
                      BankX does not store your private key or
                      seed phrase. Transactions require approval
                      from your connected wallet.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

function InfoBox({
  title,
  value,
  action,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#fafafe] p-5">

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold text-gray-400">
          {title}
        </p>

        {action}

      </div>

      <p className="mt-3 break-all text-sm font-bold">
        {value}
      </p>

    </div>
  );
}

function getNetworkName(chainId) {

  const id = chainId.toString();

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

  return networks[id] || `Chain ${id}`;
}
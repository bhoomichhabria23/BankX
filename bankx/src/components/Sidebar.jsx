import {
  BarChart3,
  CircleDollarSign,
  Coins,
  CreditCard,
  Gem,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Vote,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  connectWalletConnect,
  disconnectWalletConnect,
  getWalletProvider,
  isWalletConnectActive,
  walletConnectConfigured,
} from "../config/wallet";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    const walletProvider = getWalletProvider();
    if (!walletProvider) return undefined;

    const updateWalletConnection = async () => {
      try {
        const accounts = await walletProvider.request({
          method: "eth_accounts",
        });
        setWalletConnected(accounts.length > 0);
      } catch {
        setWalletConnected(false);
      }
    };

    const handleAccountsChanged = (accounts) => {
      setWalletConnected(accounts.length > 0);
    };

    void updateWalletConnection();
    walletProvider.on("accountsChanged", handleAccountsChanged);

    return () => {
      walletProvider.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const mainMenu = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: CircleDollarSign,
      label: "Savings",
      path: "/savings",
    },
    {
      icon: Landmark,
      label: "Borrow",
      path: "/loans",
    },
    {
      icon: BarChart3,
      label: "Markets",
      path: "/markets",
    },
    {
      icon: Gem,
      label: "Vaults",
      path: "/vaults",
    },
    {
      icon: Vote,
      label: "Governance",
      path: "/governance",
    },
    {
      icon: Coins,
      label: "Staking",
      path: "/staking",
    },
    {
      icon: CreditCard,
      label: "Transactions",
      path: "/transactions",
    },
  ];

  const accountMenu = [
    {
      icon: Wallet,
      label: "Wallet",
      path: "/wallet",
    },
    {
      icon: ShieldCheck,
      label: "Security",
      path: "/security",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenu(false);
  };

  const handleDisconnect = async () => {
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
      window.location.reload();
    } catch (error) {
      window.alert(
        error?.message ||
          "Could not disconnect this wallet. Revoke BankX in the wallet's connected-sites settings."
      );
    }
  };

  const handleWalletConnect = async () => {
    setWalletError("");
    try {
      await connectWalletConnect();
      window.location.reload();
    } catch (error) {
      setWalletError(
        error?.shortMessage ||
          error?.message ||
          "Could not connect using WalletConnect.",
      );
    }
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setMobileMenu(true)}
        className="fixed left-4 top-4 z-30 rounded-xl bg-[#211d4f] p-3 text-white shadow-lg lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[235px]
          flex-col
          bg-[#211d4f]
          text-white
          shadow-2xl
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
            onClick={() => setMobileMenu(false)}
            className="ml-auto lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 pt-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
            Main Menu
          </p>

          {mainMenu.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              onClick={handleNavigate}
            />
          ))}

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
            Account
          </p>

          {accountMenu.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              onClick={handleNavigate}
            />
          ))}

          {walletConnectConfigured && (
            <button
              onClick={handleWalletConnect}
              disabled={isWalletConnectActive()}
              className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[12px] font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white disabled:cursor-default disabled:text-white/40"
            >
              <Wallet size={17} />
              <span>{isWalletConnectActive() ? "WalletConnect connected" : "Connect WalletConnect"}</span>
            </button>
          )}

          {walletError && (
            <p role="alert" className="mb-2 break-words px-3 text-[10px] text-red-300">
              {walletError}
            </p>
          )}

          {walletConnected && (
            <button
              onClick={handleDisconnect}
              className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[12px] font-semibold text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <LogOut size={17} />
              <span>Disconnect Wallet</span>
            </button>
          )}

        </div>

        {/* PROMO */}
        <div className="shrink-0 p-3">

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
              onClick={() => handleNavigate("/vaults")}
              className="mt-3 w-full rounded-lg bg-white py-2 text-[11px] font-bold text-[#5549c8]"
            >
              Explore Vaults
            </button>

          </div>

        </div>

      </aside>
    </>
  );
}


/* ================================
   SIDEBAR ITEM
================================ */

function SidebarItem({
  icon: Icon,
  label,
  path,
  active,
  onClick,
}) {
  return (
    <button
      onClick={() => onClick(path)}
      className={`
        mb-1
        flex w-full items-center gap-3
        rounded-lg
        px-3 py-3
        text-[12px]
        font-semibold
        transition-all
        ${
          active
            ? "bg-[#6255d5] text-white shadow-lg shadow-indigo-950/20"
            : "text-white/50 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <Icon size={17} />

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
      )}
    </button>
  );
}
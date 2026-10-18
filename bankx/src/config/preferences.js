export const STARTUP_PATH_KEY = "bankx.startupPath";

export const STARTUP_PAGE_OPTIONS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/profile" },
  { label: "Savings", path: "/savings" },
  { label: "Borrow", path: "/loans" },
  { label: "Markets", path: "/markets" },
  { label: "Vaults", path: "/vaults" },
  { label: "Governance", path: "/governance" },
  { label: "Staking", path: "/staking" },
  { label: "Transactions", path: "/transactions" },
];

export function getStartupPath() {
  const savedPath = window.localStorage.getItem(STARTUP_PATH_KEY);
  return STARTUP_PAGE_OPTIONS.some(({ path }) => path === savedPath)
    ? savedPath
    : "/dashboard";
}

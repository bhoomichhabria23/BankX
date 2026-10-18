import { useState } from "react";
import { Check, House, RotateCcw, Settings as SettingsIcon } from "lucide-react";

import Sidebar from "../components/Sidebar";
import {
  STARTUP_PAGE_OPTIONS,
  STARTUP_PATH_KEY,
  getStartupPath,
} from "../config/preferences";

export default function Settings() {
  const [startupPath, setStartupPath] = useState(getStartupPath);
  const [saved, setSaved] = useState(false);

  const updateStartupPath = (event) => {
    const nextPath = event.target.value;
    window.localStorage.setItem(STARTUP_PATH_KEY, nextPath);
    setStartupPath(nextPath);
    setSaved(true);
  };

  const resetStartupPath = () => {
    window.localStorage.removeItem(STARTUP_PATH_KEY);
    setStartupPath("/dashboard");
    setSaved(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-[#202238]">
      <Sidebar />
      <main className="min-h-screen lg:ml-[245px]">
        <header className="border-b border-[#e9e9f0] bg-white px-6 py-5 lg:px-8">
          <h1 className="text-2xl font-extrabold">Settings</h1>
          <p className="mt-1 text-sm text-gray-400">
            Customize how you start and use BankX
          </p>
        </header>

        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-2xl border border-[#e9e9f0] bg-white p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <House size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Startup page</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Choose which page opens when you visit BankX. This preference is saved in this browser.
                  </p>
                </div>
              </div>

              <div className="mt-6 max-w-xl">
                <label htmlFor="startup-page" className="mb-2 block text-sm font-semibold text-[#39345f]">
                  Open BankX on
                </label>
                <select
                  id="startup-page"
                  value={startupPath}
                  onChange={updateStartupPath}
                  className="w-full rounded-lg border border-[#dedee8] bg-white px-4 py-3 text-sm text-[#202238] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                >
                  {STARTUP_PAGE_OPTIONS.map(({ label, path }) => (
                    <option key={path} value={path}>{label}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-400">
                  Your choice takes effect the next time you open the BankX home page.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={resetStartupPath}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e1e1eb] px-4 py-2.5 text-sm font-semibold text-[#39345f] transition hover:bg-gray-50"
                >
                  <RotateCcw size={15} />
                  Reset to Dashboard
                </button>
                {saved && (
                  <span role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <Check size={16} />
                    Preference saved
                  </span>
                )}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[#e9e9f0] bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <SettingsIcon className="text-violet-600" size={22} />
                <h2 className="text-lg font-bold">App and wallet</h2>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                BankX does not store wallet credentials or recovery phrases. Wallet connections and transaction approvals are managed by your browser wallet. Visit Security to review or revoke this site’s wallet access.
              </p>
              <a
                href="/security"
                className="mt-4 inline-flex rounded-lg bg-[#f1efff] px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                Open Security
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

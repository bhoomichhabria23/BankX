import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Savings from "./pages/Savings";
import Loans from "./pages/Loans";
import Markets from "./pages/Markets";
import Vaults from "./pages/Vaults";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Governance from "./pages/Governance";
import Staking from "./pages/Staking";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import { getStartupPath } from "./config/preferences";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            <Navigate
              to={getStartupPath()}
              replace
            />
          }
        />

        {/* MAIN */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/savings"
          element={<Savings />}
        />

        <Route
          path="/loans"
          element={<Loans />}
        />

        <Route
          path="/markets"
          element={<Markets />}
        />

        {/* VAULTS */}
        <Route
          path="/vaults"
          element={<Vaults />}
        />

        <Route
          path="/governance"
          element={<Governance />}
        />

        <Route
          path="/staking"
          element={<Staking />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        {/* ACCOUNT */}
        <Route
          path="/wallet"
          element={<Navigate to="/profile" replace />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/security"
          element={<Security />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* UNKNOWN */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}
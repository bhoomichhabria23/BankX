# BankX

BankX is a testnet-focused DeFi prototype with a React dashboard and Ethereum smart contracts. It includes an original ETH savings/loan pool and a separate BANK token protocol with ERC-4626 vaults, a BANK/USDC automated market maker, staking, governance, protocol loans, and an ETH/USD price-feed reader. The BANK and Circle-USDC vaults hold idle assets and do not generate yield. Sepolia tokens have no monetary value.

## Project layout

- `bankx/` — React, Vite, and ethers.js frontend.
- `bankx-contract/contracts/` — Solidity contracts and test mocks.
- `bankx-contract/scripts/` — local, protocol, and USDC vault deployment scripts.
- `bankx-contract/test/` — Hardhat contract tests.
- `bankx/src/config/deployments.json` — contract addresses keyed by chain ID.
- `.env` — shared local configuration and secrets; never commit or share it.

## Requirements and configuration

Install a current Node.js LTS release. Install dependencies in each app directory:

```powershell
cd bankx
npm install
cd ..\bankx-contract
npm install
```

Create a workspace-root `.env` (next to this README) for local use. Vite and Hardhat are configured to read this shared file. Set only the values needed for your workflow:

| Variable | Used for |
| --- | --- |
| `VITE_WALLETCONNECT_PROJECT_ID` | Optional WalletConnect support in the frontend. |
| `VITE_BANKX_ADDRESS` or `VITE_LEGACY_BANKX_ADDRESS` | Optional legacy ETH pool address override. |
| `SEPOLIA_RPC_URL`, `PRIVATE_KEY` | Sepolia contract deployments; use a disposable, testnet-funded wallet. |
| `BANKX_TREASURY_ADDRESS`, `BANKX_TREASURY_ALLOCATION`, `BANKX_STAKING_ALLOCATION`, `BANKX_AMM_ALLOCATION` | Optional protocol deployment settings. |
| `SEPOLIA_USDC_ADDRESS`, `SEPOLIA_ETH_USD_FEED`, `CHAINLINK_MAX_STALENESS_SECONDS` | Sepolia protocol deployment configuration. |
| `LOCAL_ETH_USD_ANSWER`, `LOCAL_MOCK_USDC_MINT` | Local mock feed and optional mock USDC funding. |
| `LEGACY_BANKX_ADDRESS` | Optional legacy contract address recorded during protocol deployment. |

Only `VITE_` variables are exposed to frontend code. Never put private keys or other secrets in variables prefixed with `VITE_`. Do not use a mainnet private key.

## Run the frontend

```powershell
cd bankx
npm run dev
```

Production build and lint:

```powershell
npm run build
npm run lint
```

Connect an injected wallet or WalletConnect wallet on a supported network. The app reads protocol contract addresses from `bankx/src/config/deployments.json`.

## Contracts, tests, and deployments

Hardhat is required for compiling, testing, and deploying the Solidity contracts. From `bankx-contract/`:

```powershell
npm test
npm run compile
```

The Hardhat local network uses chain ID `31337`; Sepolia uses chain ID `11155111`. Start a local node and deploy the local protocol in separate terminals:

```powershell
npm run node:local
npm run deploy:protocol:local
```

Deploy protocol contracts or the Circle Sepolia USDC vault using:

```powershell
npm run deploy:protocol:sepolia
npm run deploy:usdc-vault:sepolia
```

Deployments require the appropriate RPC, addresses, testnet funds, and environment variables. Review scripts and confirm the target network before sending transactions. Protocol deployments write addresses to the frontend manifest. The USDC vault uses the configured Circle USDC token; it is separate from the BANK vault. Do not deploy to mainnet without a separate security review.

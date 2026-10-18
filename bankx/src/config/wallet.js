import EthereumProvider from "@walletconnect/ethereum-provider";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
const sepoliaChainId = 11155111;

let walletConnectProviderPromise;

export const walletConnectConfigured = Boolean(projectId);

export function getWalletProvider() {
  return window.bankxWalletProvider || window.ethereum || null;
}

export function isWalletConnectActive() {
  return Boolean(
    window.bankxWalletProvider &&
      window.bankxWalletProvider === walletConnectProvider,
  );
}

let walletConnectProvider;

export async function initializeWalletConnect() {
  if (!projectId) return null;

  if (!walletConnectProviderPromise) {
    walletConnectProviderPromise = EthereumProvider.init({
      projectId,
      chains: [sepoliaChainId],
      methods: [
        "eth_sendTransaction",
        "personal_sign",
        "eth_signTypedData",
        "eth_signTypedData_v4",
      ],
      events: ["chainChanged", "accountsChanged"],
      showQrModal: true,
      metadata: {
        name: "BankX",
        description: "BankX DeFi application",
        url: window.location.origin,
        icons: [],
      },
    }).then((provider) => {
      walletConnectProvider = provider;
      if (provider.session) window.bankxWalletProvider = provider;
      provider.on("disconnect", () => {
        if (window.bankxWalletProvider === provider) {
          delete window.bankxWalletProvider;
        }
      });
      return provider;
    });
  }

  return walletConnectProviderPromise;
}

export async function connectWalletConnect() {
  const provider = await initializeWalletConnect();
  if (!provider) {
    throw new Error("WalletConnect is not configured for this application.");
  }

  if (!provider.session) await provider.connect();
  window.bankxWalletProvider = provider;
  return provider;
}

export async function disconnectWalletConnect() {
  if (!isWalletConnectActive()) return;

  const provider = await initializeWalletConnect();
  await provider.disconnect();
  delete window.bankxWalletProvider;
}

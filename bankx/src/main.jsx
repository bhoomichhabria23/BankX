import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeWalletConnect } from './config/wallet.js'

async function renderApp() {
  try {
    await initializeWalletConnect()
  } catch (error) {
    console.error('WalletConnect initialization failed:', error)
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void renderApp()

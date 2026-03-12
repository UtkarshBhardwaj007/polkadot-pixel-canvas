import { useState } from "react";
import { useCanvas } from "./hooks/useCanvas";
import Canvas from "./components/Canvas";
import ColorPicker from "./components/ColorPicker";
import WalletConnect from "./components/WalletConnect";
import Stats from "./components/Stats";
import ActivityFeed from "./components/ActivityFeed";

export default function App() {
  const {
    pixels,
    account,
    balance,
    isConnected,
    isLoading,
    cooldown,
    totalPlaced,
    myPlaced,
    recentEvents,
    error,
    txPending,
    connectWallet,
    placePixel,
  } = useCanvas();

  const [selectedColor, setSelectedColor] = useState(0xe6007a); // Polkadot pink

  const handlePixelClick = (x: number, y: number) => {
    placePixel(x, y, selectedColor);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-polkadot-pink to-polkadot-purple flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
                <rect x="11" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7" />
                <rect x="2" y="11" width="5" height="5" rx="1" fill="white" opacity="0.5" />
                <rect x="11" y="11" width="5" height="5" rx="1" fill="white" opacity="0.3" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                PixelCanvas
              </h1>
              <p className="text-xs text-gray-500">
                On-chain pixel art on Polkadot Hub
              </p>
            </div>
          </div>

          <WalletConnect
            account={account}
            balance={balance}
            isConnected={isConnected}
            isLoading={isLoading}
            onConnect={connectWallet}
          />
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-red-900/30 border border-red-800/50 text-red-300 text-sm rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-red-400 hover:text-red-200 text-xs underline ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Canvas */}
          <div className="space-y-4">
            <div className="max-w-[640px] mx-auto lg:mx-0">
              <Canvas
                pixels={pixels}
                selectedColor={selectedColor}
                isConnected={isConnected}
                txPending={txPending}
                onPixelClick={handlePixelClick}
              />
            </div>

            {!isConnected && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Connect your MetaMask wallet to the{" "}
                  <span className="text-polkadot-pink font-semibold">
                    Polkadot Hub Testnet
                  </span>{" "}
                  to start painting pixels on-chain.
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Need test tokens?{" "}
                  <a
                    href="https://faucet.polkadot.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-polkadot-cyan hover:underline"
                  >
                    Get PAS from the faucet
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />

            <Stats
              totalPlaced={totalPlaced}
              myPlaced={myPlaced}
              cooldown={cooldown}
              isConnected={isConnected}
              txPending={txPending}
            />

            <ActivityFeed events={recentEvents} />

            {/* Info card */}
            <div className="bg-[#12121f] border border-[#2a2a4a] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                How it works
              </h3>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Connect your MetaMask wallet</li>
                <li>Pick a color from the palette</li>
                <li>Click any pixel on the canvas</li>
                <li>Confirm the transaction (costs a tiny gas fee)</li>
                <li>Wait 30s before placing your next pixel</li>
              </ol>
              <p className="text-xs text-gray-600 mt-3">
                Every pixel is stored on the Polkadot Hub blockchain. This
                canvas is shared with everyone!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] mt-12 py-6 text-center">
        <p className="text-xs text-gray-600">
          Built on{" "}
          <a
            href="https://polkadot.com"
            target="_blank"
            rel="noreferrer"
            className="text-polkadot-pink hover:underline"
          >
            Polkadot Hub
          </a>{" "}
          &middot; Smart contract verified on{" "}
          <a
            href="https://blockscout-testnet.polkadot.io"
            target="_blank"
            rel="noreferrer"
            className="text-polkadot-cyan hover:underline"
          >
            Blockscout
          </a>
        </p>
      </footer>
    </div>
  );
}

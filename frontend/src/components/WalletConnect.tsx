interface WalletConnectProps {
  account: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
}

export default function WalletConnect({
  account,
  balance,
  isConnected,
  isLoading,
  onConnect,
}: WalletConnectProps) {
  const truncated = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  const formattedBalance = parseFloat(balance).toFixed(4);

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl px-4 py-2.5">
        <div className="flex flex-col items-end">
          <span className="font-mono text-sm text-polkadot-pink font-bold">
            {truncated}
          </span>
          <span className="text-xs text-gray-400">
            {formattedBalance} PAS
          </span>
        </div>
        <div className="w-3 h-3 rounded-full bg-polkadot-green animate-pulse" />
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isLoading}
      className="bg-polkadot-pink hover:bg-pink-600 disabled:opacity-50 
                 text-white font-semibold px-6 py-2.5 rounded-xl 
                 transition-all duration-200 hover:shadow-lg hover:shadow-polkadot-pink/25"
    >
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

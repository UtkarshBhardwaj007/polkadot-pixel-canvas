interface StatsProps {
  totalPlaced: number;
  myPlaced: number;
  cooldown: number;
  isConnected: boolean;
  txPending: boolean;
}

export default function Stats({
  totalPlaced,
  myPlaced,
  cooldown,
  isConnected,
  txPending,
}: StatsProps) {
  return (
    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Stats
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
          <div className="font-mono text-2xl font-bold text-polkadot-cyan">
            {totalPlaced.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">Total Pixels</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
          <div className="font-mono text-2xl font-bold text-polkadot-green">
            {isConnected ? myPlaced.toLocaleString() : "--"}
          </div>
          <div className="text-xs text-gray-400 mt-1">Your Pixels</div>
        </div>
      </div>

      {isConnected && (
        <div className="bg-[#1a1a2e] rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Cooldown</span>
            {txPending ? (
              <span className="font-mono text-sm text-yellow-400 animate-pulse">
                Confirming tx...
              </span>
            ) : cooldown > 0 ? (
              <span className="font-mono text-sm text-polkadot-pink font-bold">
                {cooldown}s
              </span>
            ) : (
              <span className="font-mono text-sm text-polkadot-green font-bold">
                Ready
              </span>
            )}
          </div>

          {cooldown > 0 && !txPending && (
            <div className="mt-2 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-polkadot-pink to-polkadot-purple rounded-full transition-all duration-1000"
                style={{ width: `${((30 - cooldown) / 30) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {!isConnected && (
        <p className="text-xs text-gray-500 text-center">
          Connect wallet to start painting
        </p>
      )}
    </div>
  );
}

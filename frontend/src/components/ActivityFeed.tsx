import type { PixelEvent } from "../hooks/useCanvas";

interface ActivityFeedProps {
  events: PixelEvent[];
}

function colorToHex(color: number): string {
  return "#" + color.toString(16).padStart(6, "0");
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Live Activity
      </h3>

      {events.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">
          No activity yet. Be the first to paint!
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
          {events.map((evt, i) => (
            <div
              key={`${evt.painter}-${evt.x}-${evt.y}-${i}`}
              className="flex items-center gap-2.5 text-sm py-1.5 slide-in"
            >
              <div
                className="w-4 h-4 rounded flex-shrink-0 border border-white/10"
                style={{ backgroundColor: colorToHex(evt.color) }}
              />
              <span className="font-mono text-xs text-polkadot-cyan">
                {truncateAddress(evt.painter)}
              </span>
              <span className="text-gray-500">painted</span>
              <span className="font-mono text-xs text-gray-300">
                ({evt.x},{evt.y})
              </span>
              <span className="text-gray-600 text-xs ml-auto">
                {timeAgo(evt.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

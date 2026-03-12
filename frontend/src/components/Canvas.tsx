import { useCallback } from "react";
import { CANVAS_SIZE } from "../config/contract";

interface CanvasProps {
  pixels: number[];
  selectedColor: number;
  isConnected: boolean;
  txPending: boolean;
  onPixelClick: (x: number, y: number) => void;
}

function colorToHex(color: number): string {
  return "#" + color.toString(16).padStart(6, "0");
}

export default function Canvas({
  pixels,
  selectedColor,
  isConnected,
  txPending,
  onPixelClick,
}: CanvasProps) {
  const handleClick = useCallback(
    (x: number, y: number) => {
      if (!isConnected || txPending) return;
      onPixelClick(x, y);
    },
    [isConnected, txPending, onPixelClick]
  );

  return (
    <div className={`canvas-grid ${txPending ? "opacity-70 pointer-events-none" : ""}`}>
      {Array.from({ length: CANVAS_SIZE * CANVAS_SIZE }, (_, i) => {
        const x = i % CANVAS_SIZE;
        const y = Math.floor(i / CANVAS_SIZE);
        const color = pixels[i];
        const bgColor = color === 0 ? "#16162a" : colorToHex(color);

        return (
          <button
            key={i}
            className="pixel-cell"
            style={
              {
                backgroundColor: bgColor,
                "--hover-color": colorToHex(selectedColor),
              } as React.CSSProperties
            }
            onClick={() => handleClick(x, y)}
            onMouseEnter={(e) => {
              if (isConnected && !txPending) {
                (e.target as HTMLElement).style.backgroundColor =
                  colorToHex(selectedColor);
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = bgColor;
            }}
            title={`(${x}, ${y})`}
          />
        );
      })}
    </div>
  );
}

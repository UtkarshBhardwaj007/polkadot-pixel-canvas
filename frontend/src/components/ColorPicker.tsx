import { useState } from "react";

const PALETTE = [
  0x000000, // black
  0xffffff, // white
  0xe4e4e4, // light gray
  0x888888, // gray
  0xe50000, // red
  0xe59500, // orange
  0xa06a42, // brown
  0xe5d900, // yellow
  0x94e044, // lime
  0x02be01, // green
  0x00d3dd, // cyan
  0x0083c7, // blue
  0x0000ea, // dark blue
  0xcf6ee4, // lavender
  0x820080, // purple
  0xe6007a, // polkadot pink
];

interface ColorPickerProps {
  selectedColor: number;
  onColorChange: (color: number) => void;
}

function colorToHex(color: number): string {
  return "#" + color.toString(16).padStart(6, "0");
}

function hexToColor(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

export default function ColorPicker({
  selectedColor,
  onColorChange,
}: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(colorToHex(selectedColor));

  return (
    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Color
      </h3>

      <div className="grid grid-cols-8 gap-2 mb-4">
        {PALETTE.map((color) => (
          <button
            key={color}
            className={`color-swatch ${selectedColor === color ? "active" : ""}`}
            style={{ backgroundColor: colorToHex(color) }}
            onClick={() => {
              onColorChange(color);
              setCustomHex(colorToHex(color));
            }}
            title={colorToHex(color)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg border-2 border-[#2a2a4a] flex-shrink-0"
          style={{ backgroundColor: colorToHex(selectedColor) }}
        />
        <input
          type="text"
          value={customHex}
          onChange={(e) => {
            setCustomHex(e.target.value);
            const match = e.target.value.match(/^#?([0-9a-fA-F]{6})$/);
            if (match) onColorChange(hexToColor(match[1]));
          }}
          placeholder="#FF0000"
          className="flex-1 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-2
                     font-mono text-sm text-gray-200 outline-none
                     focus:border-polkadot-pink transition-colors"
        />
      </div>
    </div>
  );
}

export const CANVAS_SIZE = 32;

// After deploying with Hardhat Ignition, paste your contract address here:
export const CONTRACT_ADDRESS = "0x302a2322A1c928786bBfFb5088CC1c0091fF00E9";

export const POLKADOT_TESTNET = {
  chainId: "0x190F1B41", // 420420417 in hex
  chainName: "Polkadot Hub Testnet",
  rpcUrls: ["https://eth-rpc-testnet.polkadot.io/"],
  blockExplorerUrls: ["https://blockscout-testnet.polkadot.io"],
  nativeCurrency: {
    name: "Paseo",
    symbol: "PAS",
    decimals: 18,
  },
};

export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "painter", type: "address" },
      { indexed: false, internalType: "uint16", name: "x", type: "uint16" },
      { indexed: false, internalType: "uint16", name: "y", type: "uint16" },
      { indexed: false, internalType: "uint24", name: "color", type: "uint24" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "PixelPlaced",
    type: "event",
  },
  {
    inputs: [],
    name: "CANVAS_HEIGHT",
    outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CANVAS_WIDTH",
    outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "COOLDOWN_SECONDS",
    outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "cooldownRemaining",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCanvas",
    outputs: [{ internalType: "uint24[]", name: "colors", type: "uint24[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint16", name: "x", type: "uint16" },
      { internalType: "uint16", name: "y", type: "uint16" },
    ],
    name: "getPixel",
    outputs: [
      { internalType: "uint24", name: "color", type: "uint24" },
      { internalType: "address", name: "painter", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lastPlacementTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "pixelsPlacedBy",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint16", name: "x", type: "uint16" },
      { internalType: "uint16", name: "y", type: "uint16" },
      { internalType: "uint24", name: "color", type: "uint24" },
    ],
    name: "setPixel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPixelsPlaced",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

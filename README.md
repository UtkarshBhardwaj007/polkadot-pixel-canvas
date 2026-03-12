# PixelCanvas: Collaborative On-Chain Pixel Art on Polkadot Hub

## Problem Statement

Collaborative digital art has always been limited by centralization. Platforms like Reddit's r/place demonstrated that millions of people *want* to create art together, but the canvas lived on Reddit's servers, could be shut down at any time, and left no permanent record of individual contributions.

PixelCanvas solves this by putting the entire canvas on-chain. Every pixel placement is a transaction on the Polkadot Hub blockchain, making the artwork:

- **Permanent**: the canvas state lives on-chain forever, not on anyone's server
- **Transparent**: every pixel can be traced back to the wallet that placed it
- **Permissionless**: anyone with a wallet can participate, no account required
- **Censorship-resistant**: no single entity can erase or modify the canvas

The 30-second cooldown per address ensures fair participation and prevents any single user from dominating the canvas.

## Live Deployment

| | |
|---|---|
| **Contract Address** | [`0x302a2322A1c928786bBfFb5088CC1c0091fF00E9`](https://blockscout-testnet.polkadot.io/address/0x302a2322A1c928786bBfFb5088CC1c0091fF00E9#code) |
| **Network** | Polkadot Hub Testnet (Chain ID: 420420417) |
| **Explorer** | [View on Blockscout](https://blockscout-testnet.polkadot.io/address/0x302a2322A1c928786bBfFb5088CC1c0091fF00E9#code) |
| **Faucet** | [Get PAS tokens](https://faucet.polkadot.io/) |

---

## What You'll Build

- A **Solidity smart contract** that stores a 32x32 pixel grid on the Polkadot Hub EVM
- A **React frontend** with wallet connection, color picker, live activity feed, and real-time canvas updates
- Full deployment to the **Polkadot Hub Testnet** with contract verification on Blockscout

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- [MetaMask](https://metamask.io/) browser extension
- Basic familiarity with Solidity and React

---

## Step 1: Clone and Install

```bash
git clone <this-repo>
cd polkadot-pixel-canvas
npm install
```

## Step 2: Understand the Smart Contract

The entire game lives in a single Solidity file: `contracts/PixelCanvas.sol`.

### Key concepts

| Concept | What it does |
|---------|-------------|
| `Pixel` struct | Stores a 24-bit RGB color and the painter's address |
| `setPixel(x, y, color)` | Places a pixel on the canvas (with a 30-second cooldown) |
| `getCanvas()` | Returns all 1,024 pixels in one call (row-major flat array) |
| `PixelPlaced` event | Emitted on every placement; the frontend listens for this |
| `cooldownRemaining(user)` | Returns seconds until the user can place again |

The contract has **no external dependencies** (no OpenZeppelin needed). It's pure Solidity, making it easy to understand and audit.

### Storage layout

Pixels are stored in a nested mapping: `mapping(uint16 => mapping(uint16 => Pixel))`. Each pixel packs a `uint24` color and an `address` painter. Stats are tracked per-address and globally.

### Polkadot Hub RPC

The contract includes a `getCanvas()` view function that reads all 1,024 pixels in one call. This works in Hardhat tests but **fails on Polkadot Hub's RPC** because the node rejects `eth_call` requests that touch too many storage slots. The frontend works around this by reconstructing the canvas from `PixelPlaced` event logs using `eth_getLogs`, which is fully supported. If you're building your own dApp on Polkadot Hub, keep this in mind: avoid view functions that do large batch reads, and prefer events for loading historical state.

## Step 3: Compile and Test

```bash
# Compile the Solidity contract
npm run compile

# Run the test suite (22 tests)
npm run test
```

Expected output:

```
  PixelCanvas
    Deployment
      ✔ should have a 32x32 canvas
      ✔ should start with zero pixels placed
      ✔ should have a 30-second cooldown
    setPixel
      ✔ should place a pixel and emit PixelPlaced
      ✔ should store the pixel color and painter
      ...
    22 passing
```

## Step 4: Get Testnet Tokens

You need PAS tokens to pay for gas on the Polkadot Hub Testnet.

1. Go to the [Polkadot Faucet](https://faucet.polkadot.io/)
2. Paste your MetaMask wallet address
3. Request testnet PAS tokens
4. Wait for confirmation (~1 minute)

## Step 5: Configure MetaMask

Add the Polkadot Hub Testnet to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Polkadot Hub Testnet |
| RPC URL | `https://eth-rpc-testnet.polkadot.io/` |
| Chain ID | `420420417` |
| Currency Symbol | `PAS` |
| Block Explorer | `https://blockscout-testnet.polkadot.io` |

The frontend will also auto-prompt you to add the network when you click "Connect Wallet."

## Step 6: Deploy to Polkadot Hub Testnet

```bash
# Create your .env file from the template
cp .env.example .env
```

Edit `.env` and add your MetaMask private key (without the `0x` prefix):

```
PRIVATE_KEY=your_private_key_here
```

> **Never share your private key or commit `.env` to git!**

Deploy with Hardhat Ignition:

```bash
npm run deploy:testnet
```

You'll see output like:

```
PixelCanvasModule#PixelCanvas - 0xYourContractAddressHere
```

Save this contract address. You'll need it for the frontend.

## Step 7: Configure the Frontend

Open `frontend/src/config/contract.ts` and paste your deployed contract address:

```typescript
export const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

## Step 8: Launch the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. You should see:

- A 32x32 pixel grid (dark/empty canvas)
- A color palette on the right
- A "Connect Wallet" button in the header

Click **Connect Wallet**, pick a color, and click any pixel to place it on-chain!

## Step 9: Verify on Blockscout

Verify your contract source code so others can read it on the explorer:

```bash
npx hardhat verify --network polkadotTestnet YOUR_CONTRACT_ADDRESS
```

Then visit: `https://blockscout-testnet.polkadot.io/address/YOUR_CONTRACT_ADDRESS`

## Step 10: Share and Collaborate

Share the frontend URL with friends. Everyone painting on the same contract will see each other's pixels appear in real time via on-chain events. The 30-second cooldown ensures everyone gets a turn.

---

## Project Structure

```
polkadot-pixel-canvas/
├── contracts/
│   └── PixelCanvas.sol           # Smart contract (32x32 pixel canvas)
├── test/
│   └── PixelCanvas.test.ts       # 22 Hardhat tests
├── ignition/
│   └── modules/
│       └── deploy.ts             # Deployment module
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app layout
│   │   ├── components/
│   │   │   ├── Canvas.tsx        # Interactive pixel grid
│   │   │   ├── ColorPicker.tsx   # Color palette + custom hex input
│   │   │   ├── WalletConnect.tsx # MetaMask connection
│   │   │   ├── ActivityFeed.tsx  # Live event stream
│   │   │   └── Stats.tsx         # Pixel counts + cooldown timer
│   │   ├── hooks/
│   │   │   └── useCanvas.ts      # All contract interaction logic
│   │   └── config/
│   │       └── contract.ts       # ABI + deployed address
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── hardhat.config.ts
├── package.json
└── .env.example
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.28 |
| Development | Hardhat 2 + Hardhat Toolbox |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 4 |
| Blockchain Lib | ethers.js v6 |
| Network | Polkadot Hub Testnet (EVM, Chain ID 420420417) |
| Explorer | [Blockscout](https://blockscout-testnet.polkadot.io) |

## Troubleshooting

**"MetaMask not found"**: Install the [MetaMask extension](https://metamask.io/).

**"insufficient funds"**: Get PAS tokens from the [faucet](https://faucet.polkadot.io/).

**"Cooldown active"**: Wait 30 seconds between pixel placements.

**Frontend shows blank canvas**: Check the browser console. If you see `CALL_EXCEPTION` errors, the contract address in `frontend/src/config/contract.ts` may be wrong, or the contract isn't deployed on the network you're connected to.

**Tests use `evm_increaseTime`**: These work on Hardhat's local network. On the real Polkadot Hub testnet, the cool down is enforced by actual block timestamps.

Polkadot Hub runs a full EVM (via Revive/REVM), so standard Solidity contracts, Hardhat, MetaMask, and ethers.js all work out of the box. You get the Ethereum developer experience plus Polkadot's interoperability, shared security, and cross-chain messaging (XCM).

To see the complete list of RPC calls supported, check out: [JSON-RPC APIs](https://docs.polkadot.com/smart-contracts/for-eth-devs/json-rpc-apis/)

For full details, see the [Polkadot Hub docs for Ethereum developers](https://docs.polkadot.com/smart-contracts/for-eth-devs/).

## License

MIT

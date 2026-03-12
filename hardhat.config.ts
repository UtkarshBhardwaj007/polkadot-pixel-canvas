import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const raw = process.env.PRIVATE_KEY;
const PRIVATE_KEY = raw ? (raw.startsWith("0x") ? raw : `0x${raw}`) : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    polkadotTestnet: {
      url: "https://eth-rpc-testnet.polkadot.io/",
      chainId: 420420417,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      polkadotTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "polkadotTestnet",
        chainId: 420420417,
        urls: {
          apiURL: "https://blockscout-testnet.polkadot.io/api",
          browserURL: "https://blockscout-testnet.polkadot.io",
        },
      },
    ],
  },
};

export default config;

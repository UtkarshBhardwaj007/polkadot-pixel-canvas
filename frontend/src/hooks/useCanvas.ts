import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  CANVAS_SIZE,
  POLKADOT_TESTNET,
} from "../config/contract";

export interface PixelEvent {
  painter: string;
  x: number;
  y: number;
  color: number;
  timestamp: number;
}

interface CanvasState {
  pixels: number[];
  account: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  cooldown: number;
  totalPlaced: number;
  myPlaced: number;
  recentEvents: PixelEvent[];
  error: string | null;
  txPending: boolean;
}

const EMPTY_CANVAS = new Array(CANVAS_SIZE * CANVAS_SIZE).fill(0);

export function useCanvas() {
  const [state, setState] = useState<CanvasState>({
    pixels: EMPTY_CANVAS,
    account: null,
    balance: "0",
    isConnected: false,
    isLoading: false,
    cooldown: 0,
    totalPlaced: 0,
    myPlaced: 0,
    recentEvents: [],
    error: null,
    txPending: false,
  });

  const providerRef = useRef<ethers.BrowserProvider | null>(null);
  const contractRef = useRef<ethers.Contract | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = (partial: Partial<CanvasState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const getReadOnlyContract = useCallback(() => {
    const provider = new ethers.JsonRpcProvider(POLKADOT_TESTNET.rpcUrls[0]);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, []);

  const loadCanvas = useCallback(async () => {
    try {
      const readOnly = getReadOnlyContract();
      const provider = readOnly.runner?.provider as ethers.JsonRpcProvider;

      const [totalBig, currentBlock] = await Promise.all([
        readOnly.totalPixelsPlaced(),
        provider.getBlockNumber(),
      ]);

      const events = await readOnly.queryFilter(
        "PixelPlaced",
        0,
        currentBlock
      );

      const pixels = new Array(CANVAS_SIZE * CANVAS_SIZE).fill(0);
      const recentEvents: PixelEvent[] = [];

      for (const evt of events) {
        const log = evt as ethers.EventLog;
        const [painter, x, y, color, timestamp] = log.args;
        const px = Number(x);
        const py = Number(y);
        pixels[py * CANVAS_SIZE + px] = Number(color);
        recentEvents.push({
          painter,
          x: px,
          y: py,
          color: Number(color),
          timestamp: Number(timestamp),
        });
      }

      update({
        pixels,
        totalPlaced: Number(totalBig),
        recentEvents: recentEvents.reverse().slice(0, 20),
      });
    } catch (err) {
      console.warn("Failed to load canvas:", err);
    }
  }, [getReadOnlyContract]);

  const loadUserStats = useCallback(
    async (address: string) => {
      try {
        const contract = contractRef.current || getReadOnlyContract();
        const [placed, remaining] = await Promise.all([
          contract.pixelsPlacedBy(address),
          contract.cooldownRemaining(address),
        ]);
        update({ myPlaced: Number(placed), cooldown: Number(remaining) });
      } catch {
        // ignore
      }
    },
    [getReadOnlyContract]
  );

  const startCooldownTimer = useCallback(() => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.cooldown <= 0) {
          if (cooldownIntervalRef.current)
            clearInterval(cooldownIntervalRef.current);
          return prev;
        }
        return { ...prev, cooldown: prev.cooldown - 1 };
      });
    }, 1000);
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      update({ error: "MetaMask not found. Please install it." });
      return;
    }

    try {
      update({ isLoading: true, error: null });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: POLKADOT_TESTNET.chainId }],
        });
      } catch (switchError: unknown) {
        const err = switchError as { code?: number };
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLKADOT_TESTNET],
          });
        } else {
          throw switchError;
        }
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      const balance = await provider.getBalance(accounts[0]);

      providerRef.current = provider;
      contractRef.current = contract;

      update({
        account: accounts[0],
        balance: ethers.formatEther(balance),
        isConnected: true,
        isLoading: false,
      });

      await Promise.all([loadCanvas(), loadUserStats(accounts[0])]);
    } catch (err: unknown) {
      const error = err as Error;
      update({
        error: error.message || "Failed to connect wallet",
        isLoading: false,
      });
    }
  }, [loadCanvas, loadUserStats]);

  const placePixel = useCallback(
    async (x: number, y: number, color: number) => {
      if (!contractRef.current || !state.account) {
        update({ error: "Connect your wallet first" });
        return;
      }
      if (state.cooldown > 0) {
        update({ error: `Cooldown active: ${state.cooldown}s remaining` });
        return;
      }

      try {
        update({ txPending: true, error: null });
        const tx = await contractRef.current.setPixel(x, y, color);
        await tx.wait();

        setState((prev) => {
          const newPixels = [...prev.pixels];
          newPixels[y * CANVAS_SIZE + x] = color;
          return {
            ...prev,
            pixels: newPixels,
            cooldown: 30,
            myPlaced: prev.myPlaced + 1,
            totalPlaced: prev.totalPlaced + 1,
            txPending: false,
          };
        });
        startCooldownTimer();
      } catch (err: unknown) {
        const error = err as Error;
        update({
          error: error.message?.includes("Cooldown")
            ? "Cooldown active, wait before placing again"
            : error.message || "Transaction failed",
          txPending: false,
        });
      }
    },
    [state.account, state.cooldown, startCooldownTimer]
  );

  // Poll for PixelPlaced events (Polkadot Hub doesn't support eth_newFilter)
  useEffect(() => {
    let stopped = false;
    let lastBlock = 0;

    const poll = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          POLKADOT_TESTNET.rpcUrls[0]
        );
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );

        lastBlock = await provider.getBlockNumber();

        while (!stopped) {
          await new Promise((r) => setTimeout(r, 6000));
          if (stopped) break;

          try {
            const currentBlock = await provider.getBlockNumber();
            if (currentBlock <= lastBlock) continue;

            const events = await contract.queryFilter(
              "PixelPlaced",
              lastBlock + 1,
              currentBlock
            );
            lastBlock = currentBlock;

            for (const evt of events) {
              const log = evt as ethers.EventLog;
              const [painter, x, y, color, timestamp] = log.args;
              const pixelEvent: PixelEvent = {
                painter,
                x: Number(x),
                y: Number(y),
                color: Number(color),
                timestamp: Number(timestamp),
              };

              setState((prev) => {
                if (painter.toLowerCase() === prev.account?.toLowerCase()) {
                  return prev;
                }
                const newPixels = [...prev.pixels];
                newPixels[pixelEvent.y * CANVAS_SIZE + pixelEvent.x] =
                  pixelEvent.color;
                return {
                  ...prev,
                  pixels: newPixels,
                  totalPlaced: prev.totalPlaced + 1,
                  recentEvents: [pixelEvent, ...prev.recentEvents].slice(0, 20),
                };
              });
            }
          } catch {
            // Transient RPC error, will retry on next poll
          }
        }
      } catch {
        // Provider init failed
      }
    };

    poll();
    return () => {
      stopped = true;
    };
  }, []);

  // Load canvas on mount
  useEffect(() => {
    loadCanvas();
  }, [loadCanvas]);

  // Handle account changes from MetaMask
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        update({ account: null, isConnected: false, balance: "0", myPlaced: 0 });
      } else {
        update({ account: accounts[0] });
        loadCanvas();
        loadUserStats(accounts[0]);
      }
    };

    const eth = window.ethereum!;
    eth.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [loadCanvas, loadUserStats]);

  return {
    ...state,
    connectWallet,
    placePixel,
    refreshCanvas: loadCanvas,
  };
}

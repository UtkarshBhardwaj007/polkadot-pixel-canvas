import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PixelCanvasModule = buildModule("PixelCanvasModule", (m) => {
  const pixelCanvas = m.contract("PixelCanvas");
  return { pixelCanvas };
});

export default PixelCanvasModule;

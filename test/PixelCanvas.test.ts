import { expect } from "chai";
import { ethers } from "hardhat";
import { PixelCanvas } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PixelCanvas", function () {
  let canvas: PixelCanvas;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const PixelCanvas = await ethers.getContractFactory("PixelCanvas");
    canvas = await PixelCanvas.deploy();
    await canvas.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should have a 32x32 canvas", async function () {
      expect(await canvas.CANVAS_WIDTH()).to.equal(32);
      expect(await canvas.CANVAS_HEIGHT()).to.equal(32);
    });

    it("should start with zero pixels placed", async function () {
      expect(await canvas.totalPixelsPlaced()).to.equal(0);
    });

    it("should have a 30-second cooldown", async function () {
      expect(await canvas.COOLDOWN_SECONDS()).to.equal(30);
    });
  });

  describe("setPixel", function () {
    it("should place a pixel and emit PixelPlaced", async function () {
      const tx = canvas.connect(alice).setPixel(5, 10, 0xff0000);
      await expect(tx)
        .to.emit(canvas, "PixelPlaced")
        .withArgs(alice.address, 5, 10, 0xff0000, (v: bigint) => v > 0n);
    });

    it("should store the pixel color and painter", async function () {
      await canvas.connect(alice).setPixel(3, 7, 0x00ff00);
      const [color, painter] = await canvas.getPixel(3, 7);
      expect(color).to.equal(0x00ff00);
      expect(painter).to.equal(alice.address);
    });

    it("should increment totalPixelsPlaced", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xffffff);
      expect(await canvas.totalPixelsPlaced()).to.equal(1);
    });

    it("should increment pixelsPlacedBy for the painter", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xffffff);
      expect(await canvas.pixelsPlacedBy(alice.address)).to.equal(1);
    });

    it("should allow overwriting a pixel", async function () {
      await canvas.connect(alice).setPixel(2, 2, 0xff0000);

      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine", []);

      await canvas.connect(bob).setPixel(2, 2, 0x0000ff);
      const [color, painter] = await canvas.getPixel(2, 2);
      expect(color).to.equal(0x0000ff);
      expect(painter).to.equal(bob.address);
    });

    it("should revert if x is out of bounds", async function () {
      await expect(
        canvas.connect(alice).setPixel(32, 0, 0xffffff)
      ).to.be.revertedWith("x out of bounds");
    });

    it("should revert if y is out of bounds", async function () {
      await expect(
        canvas.connect(alice).setPixel(0, 32, 0xffffff)
      ).to.be.revertedWith("y out of bounds");
    });

    it("should revert if cooldown is active", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xff0000);
      await expect(
        canvas.connect(alice).setPixel(1, 1, 0x00ff00)
      ).to.be.revertedWith("Cooldown active");
    });

    it("should allow placement after cooldown expires", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xff0000);

      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        canvas.connect(alice).setPixel(1, 1, 0x00ff00)
      ).to.not.be.reverted;
    });
  });

  describe("getPixel", function () {
    it("should return zero color and zero address for unset pixels", async function () {
      const [color, painter] = await canvas.getPixel(15, 15);
      expect(color).to.equal(0);
      expect(painter).to.equal(ethers.ZeroAddress);
    });

    it("should revert for out-of-bounds coordinates", async function () {
      await expect(canvas.getPixel(32, 0)).to.be.revertedWith(
        "x out of bounds"
      );
      await expect(canvas.getPixel(0, 32)).to.be.revertedWith(
        "y out of bounds"
      );
    });
  });

  describe("getCanvas", function () {
    it("should return an array of 1024 elements", async function () {
      const colors = await canvas.getCanvas();
      expect(colors.length).to.equal(1024);
    });

    it("should reflect placed pixels in correct positions", async function () {
      await canvas.connect(alice).setPixel(1, 2, 0xabcdef);
      const colors = await canvas.getCanvas();
      // Row-major: index = y * 32 + x = 2 * 32 + 1 = 65
      expect(colors[65]).to.equal(0xabcdef);
    });

    it("should return all zeros for a blank canvas", async function () {
      const colors = await canvas.getCanvas();
      for (let i = 0; i < colors.length; i++) {
        expect(colors[i]).to.equal(0);
      }
    });
  });

  describe("cooldownRemaining", function () {
    it("should return 0 for users who never placed", async function () {
      expect(await canvas.cooldownRemaining(alice.address)).to.equal(0);
    });

    it("should return >0 immediately after placing", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xff0000);
      const remaining = await canvas.cooldownRemaining(alice.address);
      expect(remaining).to.be.greaterThan(0);
    });

    it("should return 0 after cooldown expires", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xff0000);
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine", []);
      expect(await canvas.cooldownRemaining(alice.address)).to.equal(0);
    });
  });

  describe("Multiple users", function () {
    it("should track pixels for each user independently", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xff0000);
      await canvas.connect(bob).setPixel(1, 1, 0x00ff00);

      expect(await canvas.pixelsPlacedBy(alice.address)).to.equal(1);
      expect(await canvas.pixelsPlacedBy(bob.address)).to.equal(1);
      expect(await canvas.totalPixelsPlaced()).to.equal(2);
    });

    it("should enforce cooldown per user, not globally", async function () {
      await canvas.connect(alice).setPixel(0, 0, 0xff0000);
      // Bob should still be able to place immediately
      await expect(
        canvas.connect(bob).setPixel(1, 1, 0x00ff00)
      ).to.not.be.reverted;
    });
  });
});

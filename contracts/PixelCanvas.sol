// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PixelCanvas - Collaborative on-chain pixel art
/// @notice A shared 32x32 canvas where anyone can place colored pixels
contract PixelCanvas {
    uint16 public constant CANVAS_WIDTH = 32;
    uint16 public constant CANVAS_HEIGHT = 32;
    uint16 public constant COOLDOWN_SECONDS = 30;

    struct Pixel {
        uint24 color; // RGB packed into 3 bytes (0x000000 - 0xFFFFFF)
        address painter;
    }

    mapping(uint16 => mapping(uint16 => Pixel)) private _pixels;
    mapping(address => uint256) public lastPlacementTime;
    mapping(address => uint256) public pixelsPlacedBy;

    uint256 public totalPixelsPlaced;

    event PixelPlaced(
        address indexed painter,
        uint16 x,
        uint16 y,
        uint24 color,
        uint256 timestamp
    );

    /// @notice Place a pixel at (x, y) with the given RGB color
    /// @param x Column index (0-31)
    /// @param y Row index (0-31)
    /// @param color RGB color packed as uint24 (e.g. 0xFF0000 for red)
    function setPixel(uint16 x, uint16 y, uint24 color) external {
        require(x < CANVAS_WIDTH, "x out of bounds");
        require(y < CANVAS_HEIGHT, "y out of bounds");
        require(
            block.timestamp >= lastPlacementTime[msg.sender] + COOLDOWN_SECONDS,
            "Cooldown active"
        );

        _pixels[x][y] = Pixel(color, msg.sender);
        lastPlacementTime[msg.sender] = block.timestamp;
        pixelsPlacedBy[msg.sender]++;
        totalPixelsPlaced++;

        emit PixelPlaced(msg.sender, x, y, color, block.timestamp);
    }

    /// @notice Read the color and painter of a single pixel
    function getPixel(
        uint16 x,
        uint16 y
    ) external view returns (uint24 color, address painter) {
        require(x < CANVAS_WIDTH, "x out of bounds");
        require(y < CANVAS_HEIGHT, "y out of bounds");
        Pixel memory p = _pixels[x][y];
        return (p.color, p.painter);
    }

    /// @notice Read the full canvas as a flat array of colors (row-major order)
    /// @return colors Array of 1024 uint24 values (32 * 32)
    function getCanvas() external view returns (uint24[] memory colors) {
        colors = new uint24[](uint256(CANVAS_WIDTH) * uint256(CANVAS_HEIGHT));
        for (uint16 y = 0; y < CANVAS_HEIGHT; y++) {
            for (uint16 x = 0; x < CANVAS_WIDTH; x++) {
                colors[uint256(y) * uint256(CANVAS_WIDTH) + uint256(x)] = _pixels[x][y].color;
            }
        }
    }

    /// @notice Seconds remaining until the caller can place again (0 if ready)
    function cooldownRemaining(address user) external view returns (uint256) {
        uint256 elapsed = block.timestamp - lastPlacementTime[user];
        if (elapsed >= COOLDOWN_SECONDS) return 0;
        return COOLDOWN_SECONDS - elapsed;
    }
}

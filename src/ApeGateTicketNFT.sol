// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApeGateTicketNFT is ERC721, Ownable {
    struct Ticket {
        uint256 eventId;
        string eventName;
        uint256 timestamp;
    }

    uint256 public nextTokenId;
    mapping(uint256 => Ticket) public tickets;

    /// @notice EspHypERC20 (destination router) authorized to mint
    address public espHypERC20;

    event TicketMinted(
        address indexed to,
        uint256 indexed eventId,
        uint256 indexed tokenId
    );

    constructor(
        string memory name_,
        string memory symbol_,
        address _espHypERC20
    )
        ERC721(name_, symbol_)
    {
        espHypERC20 = _espHypERC20;
    }

    modifier onlyEspHypERC20() {
        require(msg.sender == espHypERC20, "Only EspHypERC20 can mint");
        _;
    }

    /// @notice Set router contract (called once after deployment)
    function setEspHypERC20(address _espHypERC20) external onlyOwner {
        require(_espHypERC20 != address(0), "Invalid address");
        espHypERC20 = _espHypERC20;
    }

    /// @notice Mint a ticket NFT (called after cross-chain validation)
    function mint(
        address to,
        uint256 eventId,
        uint256 timestamp
    ) external onlyEspHypERC20 returns (uint256) {
        require(to != address(0), "Invalid recipient");

        uint256 tokenId = ++nextTokenId;

        tickets[tokenId] = Ticket({
            eventId: eventId,
            eventName: "ApeGate Event",
            timestamp: timestamp
        });

        _mint(to, tokenId);

        emit TicketMinted(to, eventId, tokenId);

        return tokenId;
    }

    /// @notice On-chain metadata (Base64 JSON)
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "No such token");

        Ticket memory t = tickets[tokenId];

        string memory json = string(
            abi.encodePacked(
                '{"name":"ApeGate Ticket #',
                _toString(tokenId),
                '","description":"Access ticket for ApeGate event",',
                '"attributes":[',
                '{"trait_type":"eventId","value":"',
                _toString(t.eventId),
                '"},',
                '{"trait_type":"timestamp","value":"',
                _toString(t.timestamp),
                '"}',
                ']}'
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                _base64(bytes(json))
            )
        );
    }

    // ------------------------
    // Internal helpers
    // ------------------------

    function _toString(uint256 value)
        internal
        pure
        returns (string memory)
    {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);

        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }

    string internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function _base64(bytes memory data)
        internal
        pure
        returns (string memory)
    {
        if (data.length == 0) return "";

        string memory table = TABLE;
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(input, 0x3F))))
                out := shl(224, out)

                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }

            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return result;
    }
}

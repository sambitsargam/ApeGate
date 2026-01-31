// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApeGateTicketNFT is ERC721, Ownable {
    struct Ticket {
        uint256 eventId;
        string eventName; // optional human label
        uint256 timestamp;
    }

    uint256 public nextTokenId;
    mapping(uint256 => Ticket) public tickets;
    address public router; // router contract allowed to mint

    event TicketMinted(address indexed to, uint256 indexed eventId, uint256 indexed tokenId);

    constructor(string memory name_, string memory symbol_, address _router) ERC721(name_, symbol_) {
        router = _router;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "Only router can mint");
        _;
    }

    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    function mint(address to, uint256 eventId, uint256 timestamp) external onlyRouter returns (uint256) {
        uint256 tokenId = ++nextTokenId;
        tickets[tokenId] = Ticket({eventId: eventId, eventName: "ApeGate Event", timestamp: timestamp});
        _mint(to, tokenId);
        emit TicketMinted(to, eventId, tokenId);
        return tokenId;
    }

    /// @notice Basic on-chain tokenURI using plain JSON; can be replaced with IPFS metadata in a production deployment.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "No such token");
        Ticket memory t = tickets[tokenId];
        // Very small JSON
        string memory json = string(abi.encodePacked('{"name":"ApeGate Ticket #', _toString(tokenId), '","description":"Event ', _toString(t.eventId), '","attributes":[{"trait_type":"eventId","value":"', _toString(t.eventId), '"}],"timestamp":', _toString(t.timestamp), '}'));
        return string(abi.encodePacked('data:application/json;base64,', _base64(bytes(json))));
    }

    // --- helpers ---
    function _toString(uint256 value) internal pure returns (string memory) {
        // From OpenZeppelin Strings.toString simplified
        if (value == 0) {
            return "0";
        }
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

    /// @dev Base64 encoder (not optimized). Sufficient for demo purposes.
    string internal constant TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function _base64(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return '';
        string memory table = TABLE;
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            for {
                let i := 0
            } lt(i, mload(data)) {
            } {
                i := add(i, 3)
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

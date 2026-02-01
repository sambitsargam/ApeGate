// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IMailbox {
    function latestDispatchedId() external view returns (bytes32);
}

interface IInterchainSecurityModule {
    function verify(bytes calldata metadata, bytes calldata message) external view returns (bool);
}

interface IApeGateTicketNFT {
    function mint(address to, uint256 eventId, uint256 timestamp) external returns (uint256);
}

/// @title EspHypERC20 (Presto Destination Chain)
/// @notice Receives cross-chain messages on ApeChain Gary, verifies via ISM, and mints NFTs
/// @dev Validates message integrity via Hyperlane ISM, then calls NFT mint
contract EspHypERC20 {
    IMailbox public mailbox;
    IInterchainSecurityModule public ism;
    IApeGateTicketNFT public ticketNFT;
    address public owner;
    uint32 public sourceChainId;
    address public sourceMarketplace; // EspHypNative contract address on source chain

    // Track ProcessId (message hash) to ensure no double-spending
    mapping(bytes32 => bool) public processedMessages;

    event ProcessId(bytes32 indexed messageId);
    event TicketMinted(address indexed buyer, uint256 indexed eventId, uint256 tokenId);

    constructor(
        address _mailbox,
        address _ism,
        address _ticketNFT,
        uint32 _sourceChainId,
        address _sourceMarketplace
    ) {
        mailbox = IMailbox(_mailbox);
        ism = IInterchainSecurityModule(_ism);
        ticketNFT = IApeGateTicketNFT(_ticketNFT);
        owner = msg.sender;
        sourceChainId = _sourceChainId;
        sourceMarketplace = _sourceMarketplace;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Process inbound cross-chain message from Hyperlane relayer
    /// @dev Called by Hyperlane's mailbox after message delivery. Validates via ISM and mints NFT.
    /// @param metadata ISM metadata for signature verification
    /// @param message Encoded message from source chain
    function handle(
        uint32 origin,
        bytes32 sender,
        bytes calldata metadata,
        bytes calldata message
    ) external returns (bytes32) {
        // Verify origin chain
        require(origin == sourceChainId, "Invalid source chain");

        // Verify sender is the EspHypNative contract
        require(address(uint160(uint256(sender))) == sourceMarketplace, "Invalid sender");

        // Verify message integrity via ISM (Hyperlane's security module)
        bool isValid = ism.verify(metadata, message);
        require(isValid, "ISM verification failed");

        // Decode message: (nftRecipient, amount)
        (address nftRecipient, ) = abi.decode(message, (address, uint256));
        require(nftRecipient != address(0), "Invalid recipient");

        // Generate message ID for tracking (ProcessId event)
        bytes32 messageId = keccak256(abi.encodePacked(origin, sender, message));
        require(!processedMessages[messageId], "Message already processed");
        processedMessages[messageId] = true;

        // Emit ProcessId to match with DispatchId from source chain (event tracking)
        emit ProcessId(messageId);

        // Mint NFT to recipient (eventId = 1, timestamp = block.timestamp)
        uint256 tokenId = ticketNFT.mint(nftRecipient, 1, block.timestamp);

        emit TicketMinted(nftRecipient, 1, tokenId);

        return messageId;
    }

    function setIsm(address _ism) external onlyOwner {
        ism = IInterchainSecurityModule(_ism);
    }

    function setSourceMarketplace(address _sourceMarketplace) external onlyOwner {
        sourceMarketplace = _sourceMarketplace;
    }

    function setTicketNFT(address _ticketNFT) external onlyOwner {
        ticketNFT = IApeGateTicketNFT(_ticketNFT);
    }
}

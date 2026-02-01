// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IMailbox {
    function dispatch(uint32 destinationDomain, bytes32 recipientAddress, bytes calldata body) external payable returns (bytes32);
}

interface IInterchainSecurityModule {
    function verify(bytes calldata metadata, bytes calldata message) external view returns (bool);
}

/// @title EspHypNative (Presto Source Chain)
/// @notice Handles native token payment on source chain, initiates cross-chain NFT purchase via Hyperlane Mailbox
/// @dev Follows Espresso + Presto pattern: user pays native token → message dispatched to mailbox → validator reads via Caff finality → relayer delivers to destination
contract EspHypNative {
    IMailbox public mailbox;
    uint32 public destinationDomain; // Chain ID of ApeChain Gary (3313939)
    address public nftMarketplace; // NFT contract address on destination
    uint256 public nftSalePrice;
    uint32 public sourceChainId;

    address public owner;

    event TransferRemote(
        uint32 indexed destination,
        bytes32 indexed recipient,
        uint256 amount
    );

    constructor(
        address _mailbox,
        uint32 _destinationDomain,
        address _nftMarketplace,
        uint256 _nftSalePrice,
        uint32 _sourceChainId
    ) {
        mailbox = IMailbox(_mailbox);
        destinationDomain = _destinationDomain;
        nftMarketplace = _nftMarketplace;
        nftSalePrice = _nftSalePrice;
        sourceChainId = _sourceChainId;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Initiate cross-chain NFT purchase
    /// @param nftRecipient Address to receive the NFT on destination chain
    function initiateCrossChainNftPurchase(address nftRecipient) external payable returns (bytes32) {
        require(msg.value >= nftSalePrice, "Insufficient payment");
        require(nftRecipient != address(0), "Invalid recipient");

        // Encode the message: recipient + amount
        bytes memory body = abi.encode(nftRecipient, msg.value);

        // Convert recipient address to bytes32 for Hyperlane
        bytes32 recipient = bytes32(uint256(uint160(nftMarketplace)));

        // Dispatch to Hyperlane Mailbox
        // This writes to the mailbox, which Espresso finality confirms via Caff nodes
        bytes32 messageId = mailbox.dispatch{value: 0}(destinationDomain, recipient, body);

        // Emit TransferRemote event for front-end tracking
        emit TransferRemote(destinationDomain, recipient, msg.value);

        return messageId;
    }

    function withdraw(address payable to) external onlyOwner {
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    function setNftSalePrice(uint256 _price) external onlyOwner {
        nftSalePrice = _price;
    }
}

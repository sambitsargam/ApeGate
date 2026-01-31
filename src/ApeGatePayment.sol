// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @notice Minimal interfaces to interact with Espresso/Presto/Hyperlane mailbox patterns.
interface IEspHypNative {
    /// @notice Dispatch a message to a destination chain via Espresso-aware mailbox (Presto pattern)
    /// @param destination Domain/chain id for target chain
    /// @param message Encoded message bytes
    function sendMessage(uint32 destination, bytes calldata message) external payable;
}

contract ApeGatePayment {
    address public owner;
    IEspHypNative public mailbox;
    uint32 public destinationChain; // ApeChain domain id configured by deployer
    address public destinationRouter; // ApeGateRouter on ApeChain
    uint256 public ticketPriceWei;

    event TicketPurchased(address indexed buyer, uint256 indexed eventId);

    constructor(address _mailbox, uint32 _destinationChain, address _destinationRouter, uint256 _ticketPriceWei) {
        owner = msg.sender;
        mailbox = IEspHypNative(_mailbox);
        destinationChain = _destinationChain;
        destinationRouter = _destinationRouter;
        ticketPriceWei = _ticketPriceWei;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setTicketPrice(uint256 _priceWei) external onlyOwner {
        ticketPriceWei = _priceWei;
    }

    /// @notice Buy a ticket and dispatch a cross-chain message via Espresso-aware mailbox (Presto/EspHypNative pattern)
    /// @dev Uses native ETH payments and emits an on-chain event. The mailbox call writes to Hyperlane's mailbox so that Espresso finality + Caff nodes expose the message for validator signing.
    function buyTicket(uint256 eventId) external payable {
        require(msg.value >= ticketPriceWei, "Insufficient ETH");

        // Emit local evidence of purchase
        emit TicketPurchased(msg.sender, eventId);

        // Compose payload for destination router: abi.encode(buyer, eventId, ticketPrice)
        bytes memory message = abi.encode(msg.sender, eventId, block.timestamp);

        // Dispatch message via mailbox. The implementation follows the EspHypNative / Presto pattern described in docs.
        // NOTE: The actual mailbox contract will be configured in deployment to be an Espresso-aware Mailbox that writes messages discoverable via Caff nodes.
        mailbox.sendMessage(destinationChain, abi.encode(destinationRouter, message));

        // ETH stays in this contract; owner can withdraw later (simple treasury pattern)
    }

    function withdraw(address payable to) external onlyOwner {
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }
}

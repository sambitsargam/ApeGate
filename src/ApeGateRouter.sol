// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IInterchainSecurityModule {
    /// @dev Verify that a given message was correctly signed by validators according to the ISM
    function verify(bytes calldata metadata, bytes calldata message) external view returns (bool);
}

interface ITrustedMailbox {
    /// @dev In Hyperlane, mailbox-like contracts deliver messages. This is a minimal placeholder.
}

interface IApeGateTicketNFT {
    function mint(address to, uint256 eventId, uint256 timestamp) external returns (uint256);
}

contract ApeGateRouter {
    address public owner;
    address public mailbox; // trusted mailbox address (set at deploy)
    IInterchainSecurityModule public ism;
    IApeGateTicketNFT public ticketNFT;

    event CrossChainProcessed(address indexed buyer, uint256 eventId, uint256 tokenId);

    constructor(address _mailbox, address _ism, address _ticketNFT) {
        owner = msg.sender;
        mailbox = _mailbox;
        ism = IInterchainSecurityModule(_ism);
        ticketNFT = IApeGateTicketNFT(_ticketNFT);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Entry point called by Hyperlane relayer when a message is delivered to ApeChain
    /// @dev This function MUST validate the message via ISM before acting on it. Implementation here shows the structure and leaves room for concrete ISM integration per deployment.
    function processInbound(bytes calldata metadata, bytes calldata message) external {
        // Ensure caller is the expected mailbox in production deployments
        require(msg.sender == mailbox, "Unauthorized mailbox caller");

        // Verify via ISM (trusted validator set). The exact ISM/verification flow depends on the Hyperlane deployment and ISM implementation.
        bool ok = ism.verify(metadata, message);
        require(ok, "ISM verification failed");

        // Decode the payload: we follow the encoding from the payment contract: abi.encode(destinationRouter, abi.encode(buyer, eventId, timestamp))
        // The mailbox delivers 'message' which we expect is abi.encode(destinationRouter, innerMessage)
        (address destRouter, bytes memory inner) = abi.decode(message, (address, bytes));
        require(destRouter == address(this), "Invalid destination router");

        (address buyer, uint256 eventId, uint256 timestamp) = abi.decode(inner, (address, uint256, uint256));

        // Mint the ticket NFT on ApeChain
        uint256 tokenId = ticketNFT.mint(buyer, eventId, timestamp);

        emit CrossChainProcessed(buyer, eventId, tokenId);
    }

    function setIsm(address _ism) external onlyOwner {
        ism = IInterchainSecurityModule(_ism);
    }

    function setMailbox(address _mailbox) external onlyOwner {
        mailbox = _mailbox;
    }

    function setTicketNFT(address _ticketNFT) external onlyOwner {
        ticketNFT = IApeGateTicketNFT(_ticketNFT);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import {EspHypNative} from "../src/ApeGatePayment.sol";
import {EspHypERC20} from "../src/ApeGateRouter.sol";
import {ApeGateTicketNFT} from "../src/ApeGateTicketNFT.sol";

contract LocalDeploy is Test {
    address deployerAddress = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266); // Anvil default account 0

    function testDeploySourceChain() external {
        vm.startPrank(deployerAddress);
        
        // Deploy EspHypNative
        EspHypNative espHypNative = new EspHypNative(
            0x0000000000000000000000000000000000000000, // mailbox
            3313939,  // destination chain (Gary)
            0x0000000000000000000000000000000000000000, // nftMarketplace (will be EspHypERC20)
            1000000000000000, // nftPrice (0.001 native token)
            1337      // sourceChainId
        );
        
        require(address(espHypNative) != address(0), "EspHypNative deployment failed");
        console.log("EspHypNative deployed to:", address(espHypNative));
        
        // Deploy NFT contract
        ApeGateTicketNFT ticketNFT = new ApeGateTicketNFT(
            "ApeGate Ticket",
            "APGT",
            address(0) // Will be set to EspHypERC20
        );
        
        require(address(ticketNFT) != address(0), "ApeGateTicketNFT deployment failed");
        console.log("ApeGateTicketNFT deployed to:", address(ticketNFT));
        
        // Deploy EspHypERC20
        EspHypERC20 espHypERC20 = new EspHypERC20(
            0x0000000000000000000000000000000000000000, // mailbox (placeholder)
            0x0000000000000000000000000000000000000000, // ism (placeholder)
            address(ticketNFT),
            1337, // sourceChainId
            address(espHypNative) // sourceMarketplace
        );
        
        require(address(espHypERC20) != address(0), "EspHypERC20 deployment failed");
        console.log("EspHypERC20 deployed to:", address(espHypERC20));
        
        // Set EspHypERC20 as authorized minter
        ticketNFT.setEspHypERC20(address(espHypERC20));
        
        vm.stopPrank();
    }
}

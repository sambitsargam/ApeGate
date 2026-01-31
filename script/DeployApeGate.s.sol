// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Foundry deploy script in Solidity for convenience. This script demonstrates deploy steps and accepts environment-configured constructor args.
import "forge-std/Script.sol";

import {ApeGatePayment} from "../src/ApeGatePayment.sol";
import {ApeGateRouter} from "../src/ApeGateRouter.sol";
import {ApeGateTicketNFT} from "../src/ApeGateTicketNFT.sol";

contract DeployApeGate is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // Example environment variables expected:
        // ESP_MAILBOX - address of espresso-aware mailbox on source chain (Sepolia)
        // DEST_CHAIN_ID - uint32 domain id for ApeChain
        // DEST_ROUTER - placeholder router address on ApeChain (will be replaced after deployment)
        // TICKET_PRICE_WEI - ticket price to set

        address espMailbox = vm.envAddress("ESP_MAILBOX");
        uint32 destChain = uint32(vm.envUint("DEST_CHAIN_ID"));
        address destRouter = vm.envAddress("DEST_ROUTER");
        uint256 ticketPrice = vm.envUint("TICKET_PRICE_WEI");

        // Deploy payment contract on Sepolia
        ApeGatePayment payment = new ApeGatePayment(espMailbox, destChain, destRouter, ticketPrice);
        console.log("ApeGatePayment deployed to:", address(payment));

        // On ApeChain, deploy router and NFT then set router address in payment (manually or via orchestration)
        // Note: This script runs on the local RPC/network it is pointed to. Run it twice, once per network with proper env vars.

        vm.stopBroadcast();
    }
}

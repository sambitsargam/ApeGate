// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import {EspHypNative} from "../src/ApeGatePayment.sol";
import {EspHypERC20} from "../src/ApeGateRouter.sol";
import {ApeGateTicketNFT} from "../src/ApeGateTicketNFT.sol";

/**
 * Deployment Flow for Presto/ApeGate
 * 
 * STEP 1: Deploy on source chain (local Anvil)
 *   - Deploy EspHypNative (payment contract)
 *   - Record address
 * 
 * STEP 2: Deploy on ApeChain Gary (Destination Chain)
 *   - Deploy ApeGateTicketNFT
 *   - Deploy EspHypERC20 (receiver contract)
 *   - Set EspHypERC20 as minter in ApeGateTicketNFT
 * 
 * STEP 3: Configure both contracts
 *   - Set sourceMarketplace in EspHypERC20 to point to EspHypNative on source
 *   - Set proper mailbox/ISM addresses from Hyperlane deployment
 * 
 * STEP 4: Hyperlane Infrastructure
 *   - Validator reads Caff Node RPC (Espresso finality)
 *   - Relayer watches source → delivers to Gary
 * 
 * Usage:
 *   Deploy on source:  source .env && forge script script/DeployApeGate.s.sol:DeploySourceChain --rpc-url http://localhost:8545 --broadcast
 *   Deploy on Gary:     source .env && forge script script/DeployApeGate.s.sol:DeployDestinationChain --rpc-url $GARY_RPC --broadcast
 */

contract DeploySourceChain is Script {
    function run() external {
        string memory deployerPrivateKeyStr = vm.envString("DEPLOYER_PRIVATE_KEY_ANVIL");
        uint256 deployerKey = vm.parseUint(deployerPrivateKeyStr);
        vm.startBroadcast(deployerKey);

        address mailbox = vm.envAddress("SOURCE_MAILBOX_ADDRESS");
        uint32 destinationChainId = uint32(vm.envUint("DESTINATION_CHAIN_ID")); // 3313939 (Gary)
        address nftMarketplace = vm.envAddress("GARY_NFT_MARKETPLACE"); // Will be EspHypERC20 address on Gary
        uint256 nftPrice = vm.envUint("NFT_SALE_PRICE_WEI");
        uint32 sourceChainId = uint32(vm.envUint("SOURCE_CHAIN_ID")); // 1337 (local Anvil)

        EspHypNative espHypNative = new EspHypNative(
            mailbox,
            destinationChainId,
            nftMarketplace,
            nftPrice,
            sourceChainId
        );

        console.log("EspHypNative deployed to:", address(espHypNative));

        vm.stopBroadcast();
    }
}

contract DeployDestinationChain is Script {
    function run() external {
        string memory deployerPrivateKeyStr = vm.envString("DEPLOYER_PRIVATE_KEY_GARY");
        uint256 deployerKey = vm.parseUint(deployerPrivateKeyStr);
        vm.startBroadcast(deployerKey);

        address mailbox = vm.envAddress("GARY_MAILBOX_ADDRESS");
        address ism = vm.envAddress("GARY_ISM_ADDRESS");
        uint32 sourceChainId = uint32(vm.envUint("SOURCE_CHAIN_ID")); // 1337 (local Anvil)
        address sourceMarketplace = vm.envAddress("SOURCE_ESP_HYP_NATIVE"); // EspHypNative on source

        // Deploy NFT contract
        ApeGateTicketNFT ticketNFT = new ApeGateTicketNFT(
            "ApeGate Ticket",
            "APGT",
            address(0) // Will be set to EspHypERC20 after deployment
        );
        console.log("ApeGateTicketNFT deployed to:", address(ticketNFT));

        // Deploy EspHypERC20
        EspHypERC20 espHypERC20 = new EspHypERC20(
            mailbox,
            ism,
            address(ticketNFT),
            sourceChainId,
            sourceMarketplace
        );
        console.log("EspHypERC20 deployed to:", address(espHypERC20));

        // Set EspHypERC20 as authorized minter
        ticketNFT.setEspHypERC20(address(espHypERC20));

        vm.stopBroadcast();
    }
}

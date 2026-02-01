# Anvil Local Chain Setup

This folder contains scripts and configuration for running local Ethereum-compatible chains using Anvil and Espresso sequencer nodes for testing Hyperlane cross-chain messaging.

## Overview

- **Source Chain**: Espresso/CAFF node running on port 8547 (Chain ID: 412346)
- **Destination Chain**: Anvil instance running on port 8549 (Chain ID: 31338)
- **Purpose**: Enable local testing of Hyperlane message routing, contract deployments, and cross-chain NFT operations

## Quick Start

### 1. Load Environment Variables

```bash
cd /Users/sambit/Desktop/ApeGate/anvil
source .hyperlane_env
```

This sets up:
- Deployer private key and address
- RPC endpoints for both chains
- Chain IDs
- Gas configuration

### 2. Launch the Chains

**Terminal 1 - Source Chain (Espresso):**
```bash
./launch_source_chain.sh
```

**Terminal 2 - Destination Chain (Anvil):**
```bash
./launch_destination_chain.sh
```

Both scripts will:
- Check for port availability
- Load or create blockchain state
- Verify RPC connectivity
- Display chain details for reference

### 3. Verify Connections

```bash
# Check source chain
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SOURCE_CHAIN_RPC_URL | jq .

# Check destination chain
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $DESTINATION_CHAIN_RPC_URL | jq .
```

## Configuration Files

### `.hyperlane_env`
Central configuration file with:
- **Deployer Credentials**: Pre-funded anvil account
- **Chain Configuration**: IDs, RPC ports, and endpoints
- **Gas Settings**: Default gas price and limit
- **Hyperlane Setup**: Environment variables for Hyperlane CLI

**Key Variables:**
```bash
DEPLOYER_PRIVATE_KEY    # First anvil account (pre-funded)
DEPLOYER_ADDRESS        # 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SOURCE_CHAIN_ID         # 412346 (Espresso)
DESTINATION_CHAIN_ID    # 31338 (Anvil)
SOURCE_CHAIN_RPC_URL    # http://localhost:8547
DESTINATION_CHAIN_RPC_URL # http://localhost:8549
```

### Launch Scripts

**launch_source_chain.sh**
- Starts Espresso/CAFF node
- Loads or creates blockchain state
- Runs on port 8547

**launch_destination_chain.sh**
- Starts Anvil instance
- Loads or creates blockchain state
- Runs on port 8549

Both scripts include:
- Port conflict detection
- State management (load/dump)
- RPC connectivity verification
- Enhanced logging and debugging info

## Folder Structure

```
anvil/
├── .hyperlane_env                    # Environment configuration
├── launch_source_chain.sh            # Start source chain
├── launch_destination_chain.sh       # Start destination chain
├── hyperlane/
│   ├── chains/                       # Chain state files
│   │   ├── source/
│   │   │   └── state.json           # Espresso chain state
│   │   ├── destination/
│   │   │   └── state.json           # Anvil chain state
│   │   ├── apechain/                # ApeChain config
│   │   ├── apetestnet/              # ApeChain testnet config
│   │   ├── rarichain/               # Rari chain config
│   │   └── raritestnet/             # Rari testnet config
│   ├── deployments/
│   │   └── warp_routes/             # Warp route deployments
│   └── validator-relayer-setup/
│       ├── config/                  # Validator/relayer configs
│       ├── relayer/                 # Relayer setup
│       ├── scripts/                 # Setup scripts
│       ├── templates/               # Config templates
│       └── docker-compose.yml       # Docker setup
└── README.md                         # This file
```

## Common Tasks

### Check Chain Status

```bash
source .hyperlane_env

# Source chain status
cast block latest --rpc-url $SOURCE_CHAIN_RPC_URL

# Destination chain status
cast block latest --rpc-url $DESTINATION_CHAIN_RPC_URL
```

### Check Account Balance

```bash
source .hyperlane_env

# Check deployer balance
cast balance $DEPLOYER_ADDRESS --rpc-url $DESTINATION_CHAIN_RPC_URL
```

### Kill Running Processes

```bash
# Kill Anvil process
pkill -f "anvil.*8549"

# Kill Espresso process
pkill -f "node.*8547"
```

### Reset Blockchain State

```bash
# Remove state files to start fresh
rm ./hyperlane/chains/source/state.json
rm ./hyperlane/chains/destination/state.json

# Re-run launch scripts to create fresh state
./launch_source_chain.sh
./launch_destination_chain.sh
```

## Deploying Contracts

### Prerequisites

1. Both chains running (see Quick Start)
2. Foundry installed (`forge`, `cast`, `anvil`)
3. Environment configured: `source .hyperlane_env`

### Example: Deploy on Destination Chain

```bash
source .hyperlane_env

# From project root
forge create src/MyContract.sol:MyContract \
  --rpc-url $DESTINATION_CHAIN_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --gas-price $GAS_PRICE
```

## Hyperlane Integration

The Hyperlane CLI will use these endpoints automatically:
```bash
export HYP_CHAINS_SOURCE_RPC=$SOURCE_CHAIN_RPC_URL
export HYP_CHAINS_DESTINATION_RPC=$DESTINATION_CHAIN_RPC_URL
```

### Deploy Hyperlane Mailbox

```bash
source .hyperlane_env

# Run Hyperlane deployment from project root
npx @hyperlane-xyz/cli deploy core --environment local
```

## Troubleshooting

### Port Already in Use

If you see "Port X is already in use":
```bash
# The launch scripts will automatically kill existing processes
# Or manually:
lsof -i :8547  # Find process on port 8547
kill -9 <PID>
```

### RPC Connection Failed

```bash
# Verify service is running
curl -X POST http://localhost:8549 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check logs from launch script terminal
# Look for "compiled successfully" messages
```

### Out of Gas

Increase gas limit in `.hyperlane_env`:
```bash
export GAS_LIMIT=10000000  # or higher
```

### Deployer Account Has No Balance

This is a known issue on testnet. Solutions:
1. Use a pre-funded account from the blockchain's faucet
2. Deploy contracts directly with the Anvil instance (which has unlimited balance)
3. Transfer funds from another pre-funded account

## Advanced Configuration

### Custom Chain IDs

Edit `.hyperlane_env`:
```bash
export SOURCE_CHAIN_ID=YOUR_ID
export DESTINATION_CHAIN_ID=YOUR_ID
```

### Custom Ports

Edit `.hyperlane_env`:
```bash
export RPC_SOURCE_CHAIN_PORT=YOUR_PORT
export RPC_DESTINATION_CHAIN_PORT=YOUR_PORT
```

### Enable State Dumps

For debugging, capture final state:
```bash
# Edit launch_source_chain.sh to use --dump-state instead of --load-state
```

## References

- [Hyperlane Documentation](https://docs.hyperlane.xyz/)
- [Anvil Documentation](https://book.getfoundry.sh/reference/anvil/)
- [Foundry Cast Commands](https://book.getfoundry.sh/cast/README)

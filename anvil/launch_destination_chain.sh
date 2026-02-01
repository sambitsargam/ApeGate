#!/usr/bin/env bash

# ============================================================================
# Anvil Destination Chain Launcher
# Launches a local Anvil instance for testing Hyperlane integrations
# ============================================================================

set -euo pipefail

# Load environment configuration
source .hyperlane_env

echo "============================================================================"
echo "🚀 Launching Destination Chain (Anvil)"
echo "============================================================================"
echo "Chain ID: $DESTINATION_CHAIN_ID"
echo "RPC URL: $DESTINATION_CHAIN_RPC_URL"
echo "Port: $RPC_DESTINATION_CHAIN_PORT"
echo "Block Time: 2 seconds"
echo "============================================================================"
echo ""

# Check if port is already in use
if lsof -Pi :$RPC_DESTINATION_CHAIN_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠️  Port $RPC_DESTINATION_CHAIN_PORT is already in use"
  echo "Killing existing process..."
  pkill -f "anvil.*$RPC_DESTINATION_CHAIN_PORT" || true
  sleep 1
fi

# Ensure state directory exists
mkdir -p ./hyperlane/chains/destination

# Check if state file exists
if [ -f ./hyperlane/chains/destination/state.json ]; then
  echo "📂 Loading existing chain state from ./hyperlane/chains/destination/state.json"
  anvil --host 0.0.0.0 --port $RPC_DESTINATION_CHAIN_PORT --chain-id $DESTINATION_CHAIN_ID --load-state ./hyperlane/chains/destination/state.json --block-time 2 --mixed-mining
else
  echo "📝 No existing state found. Creating fresh chain state..."
  echo "⚠️  WARNING: First time setup - contract deployments will be needed"
  anvil --host 0.0.0.0 --port $RPC_DESTINATION_CHAIN_PORT --chain-id $DESTINATION_CHAIN_ID --dump-state ./hyperlane/chains/destination/state.json --block-time 2 --mixed-mining
  echo "✅ State saved to ./hyperlane/chains/destination/state.json"
fi

echo ""
echo "⏱️  Waiting for chain to be ready..."
sleep 2

# Verify connection
if curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $DESTINATION_CHAIN_RPC_URL > /dev/null 2>&1; then
  echo "✅ Destination chain is running and responding to RPC calls"
else
  echo "⚠️  Destination chain may not be responding yet, but launcher script completed"
fi

echo ""
echo "============================================================================"
echo "📡 Destination Chain Details:"
echo "  - RPC URL: $DESTINATION_CHAIN_RPC_URL"
echo "  - Chain ID: $DESTINATION_CHAIN_ID"
echo "  - Deployer Address: $DEPLOYER_ADDRESS"
echo "============================================================================"

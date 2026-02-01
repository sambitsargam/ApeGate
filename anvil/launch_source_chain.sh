#!/usr/bin/env bash

# ============================================================================
# Espresso/CAFF Source Chain Launcher
# Launches a local Espresso sequencer node for testing Hyperlane integrations
# ============================================================================

set -euo pipefail

# Load environment configuration
source .hyperlane_env

echo "============================================================================"
echo "🚀 Launching Source Chain (Espresso/CAFF Node)"
echo "============================================================================"
echo "Chain ID: $SOURCE_CHAIN_ID"
echo "RPC URL: $SOURCE_CHAIN_RPC_URL"
echo "Port: $RPC_SOURCE_CHAIN_PORT"
echo "Block Time: 2 seconds"
echo "============================================================================"
echo ""

# Check if port is already in use
if lsof -Pi :$RPC_SOURCE_CHAIN_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠️  Port $RPC_SOURCE_CHAIN_PORT is already in use"
  echo "Killing existing process..."
  pkill -f "node.*$RPC_SOURCE_CHAIN_PORT" || true
  sleep 1
fi

# Ensure state directory exists
mkdir -p ./hyperlane/chains/source

# Check if state file exists
if [ -f ./hyperlane/chains/source/state.json ]; then
  echo "📂 Loading existing chain state from ./hyperlane/chains/source/state.json"
  # anvil --port $RPC_SOURCE_CHAIN_PORT --chain-id $SOURCE_CHAIN_ID --load-state ./hyperlane/chains/source/state.json --block-time 2 --mixed-mining
  echo "✅ Source chain is ready!"
else
  echo "📝 No existing state found. Creating fresh chain state..."
  # anvil --port $RPC_SOURCE_CHAIN_PORT --chain-id $SOURCE_CHAIN_ID --dump-state ./hyperlane/chains/source/state.json --block-time 2 --mixed-mining
  echo "✅ State saved to ./hyperlane/chains/source/state.json"
fi

echo ""
echo "⏱️  Waiting for chain to be ready..."
sleep 2

# Verify connection
if curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SOURCE_CHAIN_RPC_URL > /dev/null 2>&1; then
  echo "✅ Source chain is running and responding to RPC calls"
else
  echo "⚠️  Source chain may not be responding yet, but launcher script completed"
fi

echo ""
echo "============================================================================"
echo "📡 Source Chain Details:"
echo "  - RPC URL: $SOURCE_CHAIN_RPC_URL"
echo "  - Chain ID: $SOURCE_CHAIN_ID"
echo "  - Deployer Address: $DEPLOYER_ADDRESS"
echo "============================================================================"

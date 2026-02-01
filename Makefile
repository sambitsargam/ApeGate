# ApeGate Development Tasks
# Based on composables-xchain-mint reference implementation

set shell := ["bash", "-c"]

# Start local Anvil chains (source + destination simulators)
launch-anvil:
    #!/bin/bash
    echo "Starting Anvil chains..."
    # Source chain on port 8545
    anvil --port 8545 --chain-id 1337 &
    SOURCE_PID=$!
    sleep 2
    echo "Source chain (Anvil) running on port 8545"
    
    # Destination chain on port 8546 (for testing; normally Gary testnet RPC)
    anvil --port 8546 --chain-id 3313939 &
    DEST_PID=$!
    sleep 2
    echo "Destination chain (Anvil) running on port 8546"
    echo "PIDs: $SOURCE_PID $DEST_PID"
    wait

# Build contracts
build:
    forge build

# Test contracts
test:
    forge test

# Deploy to local Anvil (source chain)
deploy-source:
    #!/bin/bash
    source .env
    echo "Deploying EspHypNative to local Anvil..."
    forge script script/DeployApeGate.s.sol:DeploySourceChain \
      --rpc-url http://localhost:8545 \
      --broadcast \
      --private-key $DEPLOYER_PRIVATE_KEY

# Deploy to ApeChain Gary (destination chain)
deploy-gary:
    #!/bin/bash
    source .env
    echo "Deploying to ApeChain Gary..."
    forge script script/DeployApeGate.s.sol:DeployDestinationChain \
      --rpc-url $GARY_RPC_URL \
      --broadcast \
      --private-key $DEPLOYER_PRIVATE_KEY

# Clean up (kill anvil processes)
kill-chains:
    pkill -f "anvil --port 8545" || true
    pkill -f "anvil --port 8546" || true
    echo "Anvil chains stopped"

# Start frontend dev server
frontend-dev:
    cd frontend && npm install && npm run dev

# Full local development setup
dev: build
    echo "ApeGate local development ready!"
    echo ""
    echo "Step 1: Start Anvil chains"
    echo "  make launch-anvil"
    echo ""
    echo "Step 2: Deploy to source (in another terminal)"
    echo "  make deploy-source"
    echo ""
    echo "Step 3: Deploy to Gary destination"
    echo "  make deploy-gary"
    echo ""
    echo "Step 4: Start frontend"
    echo "  make frontend-dev"

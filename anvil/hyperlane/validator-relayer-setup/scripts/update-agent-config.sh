#!/usr/bin/env bash

# ============================================================================
# Update Agent Config - Generate agent configuration with environment vars
# ============================================================================

set -euo pipefail

echo "============================================================================"
echo "⚙️  Generating Hyperlane Agent Configuration"
echo "============================================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "Please create .env from env.example:"
  echo "  cp env.example .env"
  exit 1
fi

# Load .env (safely)
set -a
source .env
set +a

echo "✅ Environment variables loaded from .env"
echo ""

# Check if template exists
if [ ! -f ./config/agent-example.json ]; then
  echo "❌ Error: Template not found at ./config/agent-example.json"
  exit 1
fi

echo "📝 Generating agent configuration..."

# Generate agent config with variable substitution
if envsubst < ./config/agent-example.json > ./config/agent.json; then
  echo ""
  echo "============================================================================"
  echo "✅ Agent configuration generated successfully"
  echo "   Location: ./config/agent.json"
  echo ""
  echo "📊 Configuration Summary:"
  echo "   - Service Name: $SERVICE_NAME"
  echo "   - Source RPC: $SOURCE_CHAIN_RPC_URL"
  echo "   - Destination RPC: $DESTINATION_CHAIN_RPC_URL"
  echo "   - Validator Address: $VALIDATOR_ADDRESS"
  echo "============================================================================"
else
  echo "❌ Failed to generate agent configuration"
  exit 1
fi

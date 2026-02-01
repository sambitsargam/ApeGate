#!/usr/bin/env bash

# ============================================================================
# Create Core Config - Generate Hyperlane core deployment configs
# ============================================================================

set -euo pipefail

echo "============================================================================"
echo "⚙️  Generating Hyperlane Core Configs"
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

# Create output directories if they don't exist
mkdir -p ../../hyperlane/chains/source
mkdir -p ../../hyperlane/chains/destination

echo "📝 Generating core configurations..."
echo ""

# Check if template exists
if [ ! -f ./templates/core-config.yaml.example ]; then
  echo "❌ Error: Template not found at ./templates/core-config.yaml.example"
  exit 1
fi

# Generate source chain config
echo "  • Source chain (espresso): ",
if envsubst < ./templates/core-config.yaml.example > ../../hyperlane/chains/source/core-config.yaml; then
  echo "✅"
else
  echo "❌ Failed"
  exit 1
fi

# Generate destination chain config
echo "  • Destination chain (anvil): ",
if envsubst < ./templates/core-config.yaml.example > ../../hyperlane/chains/destination/core-config.yaml; then
  echo "✅"
else
  echo "❌ Failed"
  exit 1
fi

echo ""
echo "============================================================================"
echo "✅ Core configs generated successfully"
echo "  - ../../hyperlane/chains/source/core-config.yaml"
echo "  - ../../hyperlane/chains/destination/core-config.yaml"
echo "============================================================================"

#!/usr/bin/env bash

# ============================================================================
# Create Warp Route Config - Generate Hyperlane warp route deployment configs
# ============================================================================

set -euo pipefail

echo "============================================================================"
echo "⚙️  Generating Hyperlane Warp Route Configs"
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
mkdir -p ../../hyperlane/deployments/warp_routes/ETH

echo "📝 Generating warp route configurations..."
echo ""

# Check if templates exist
if [ ! -f ./templates/warp-route-deploy-destination.yaml.example ]; then
  echo "❌ Error: Template not found at ./templates/warp-route-deploy-destination.yaml.example"
  exit 1
fi

if [ ! -f ./templates/warp-route-deploy-source.yaml.example ]; then
  echo "❌ Error: Template not found at ./templates/warp-route-deploy-source.yaml.example"
  exit 1
fi

# Generate destination warp route config
echo "  • Destination warp route (source→destination): ",
if envsubst < ./templates/warp-route-deploy-destination.yaml.example > ../../hyperlane/deployments/warp_routes/ETH/destination-deploy.yaml; then
  echo "✅"
else
  echo "❌ Failed"
  exit 1
fi

# Generate source warp route config
echo "  • Source warp route (destination→source): ",
if envsubst < ./templates/warp-route-deploy-source.yaml.example > ../../hyperlane/deployments/warp_routes/ETH/source-deploy.yaml; then
  echo "✅"
else
  echo "❌ Failed"
  exit 1
fi

echo ""
echo "============================================================================"
echo "✅ Warp route configs generated successfully"
echo "  - ../../hyperlane/deployments/warp_routes/ETH/destination-deploy.yaml"
echo "  - ../../hyperlane/deployments/warp_routes/ETH/source-deploy.yaml"
echo "============================================================================"

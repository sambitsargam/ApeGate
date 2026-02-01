#!/usr/bin/env bash

# ============================================================================
# Cleanup Script - Remove validator/relayer databases and temporary files
# ============================================================================

set -euo pipefail

echo "============================================================================"
echo "🧹 Cleaning up Hyperlane Validator & Relayer Data"
echo "============================================================================"
echo ""

# Remove relayer database
if [ -d "relayer/hyperlane_db" ]; then
  echo "📂 Cleaning relayer/hyperlane_db..."
  rm -rfv relayer/hyperlane_db/* 2>/dev/null || true
  touch relayer/hyperlane_db/.gitkeep
  echo "✅ Relayer database cleaned"
else
  echo "⚠️  relayer/hyperlane_db not found, skipping"
fi

# Remove source validator database
if [ -d "source/hyperlane_db" ]; then
  echo "📂 Cleaning source/hyperlane_db..."
  rm -rfv source/hyperlane_db/* 2>/dev/null || true
  touch source/hyperlane_db/.gitkeep
  echo "✅ Source validator database cleaned"
else
  echo "⚠️  source/hyperlane_db not found, skipping"
fi

echo ""
echo "============================================================================"
echo "✅ Cleanup complete"
echo "============================================================================"

# Hyperlane Validator & Relayer Setup

This directory contains scripts and configurations for running Hyperlane validator and relayer agents on local blockchain instances.

## Overview

- **Validator**: Validates Hyperlane messages from the source chain
- **Relayer**: Relays validated messages to the destination chain
- **Both**: Run in Docker containers with persistent databases
- **Configuration**: Template-based with environment variable substitution

## Quick Start

### 1. Prepare Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your values
nano .env
```

Key environment variables needed:
```bash
DEPLOYER_KEY              # Private key for contract deployment
SOURCE_CHAIN_RPC_URL      # Source chain RPC endpoint
DESTINATION_CHAIN_RPC_URL # Destination chain RPC endpoint
VALIDATOR_KEY             # Validator's private key
SERVICE_NAME              # "source" or "destination"
```

### 2. Generate Configuration Files

```bash
# Generate core deployment configs
./scripts/create-core-config.sh

# Generate warp route configs
./scripts/create-warp-route-config.sh

# Generate agent config
./scripts/update-agent-config.sh

# Optional: Clean up old databases
./scripts/cleanup.sh
```

### 3. Start Services with Docker

```bash
# Start validator and relayer
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f source-validator
docker-compose logs -f relayer
```

### 4. Verify Operation

```bash
# Check metrics
curl http://localhost:9090/metrics    # Validator metrics
curl http://localhost:9091/metrics    # Relayer metrics

# Check logs
docker-compose logs --tail=50 source-validator
docker-compose logs --tail=50 relayer
```

## File Structure

```
validator-relayer-setup/
├── README.md                          # This file
├── env.example                        # Environment variables template
├── docker-compose.yml                 # Docker services definition
├── config/
│   ├── agent-example.json            # Agent config template
│   └── agent.json                    # Generated agent config (git-ignored)
├── templates/
│   ├── core-config.yaml.example      # Core deployment config template
│   ├── warp-route-deploy-source.yaml.example
│   └── warp-route-deploy-destination.yaml.example
├── scripts/
│   ├── cleanup.sh                    # Clean databases and temp files
│   ├── create-core-config.sh         # Generate core configs
│   ├── create-warp-route-config.sh   # Generate warp route configs
│   └── update-agent-config.sh        # Generate agent config
├── source/
│   └── hyperlane_db/                 # Source chain validator database
├── relayer/
│   └── hyperlane_db/                 # Relayer service database
└── destination/
    └── hyperlane_db/                 # Destination chain database (optional)
```

## Configuration Files

### env.example
Template for environment variables. Copy to `.env` and customize:

```bash
# Service identification
SERVICE_NAME="source"

# Deployer account (for contract deployment)
DEPLOYER_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DEPLOYER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# RPC endpoints
SOURCE_CHAIN_RPC_URL="http://localhost:8547"
DESTINATION_CHAIN_RPC_URL="http://localhost:8549"

# Validator account
VALIDATOR_KEY="0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"
VALIDATOR_ADDRESS="0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
```

### config/agent-example.json
Template for Hyperlane agent configuration. Includes:
- Chain definitions (source and destination)
- RPC endpoints
- Contract addresses
- Validator signer configuration
- Database paths
- Reorg period for security

Generated file: `config/agent.json`

### templates/*.yaml.example
Deployment configuration templates for:
- **core-config.yaml**: Hyperlane core contract deployment
- **warp-route-deploy-source.yaml**: Source chain warp route
- **warp-route-deploy-destination.yaml**: Destination chain warp route

Generated files in `/hyperlane/chains/` and `/hyperlane/deployments/`

## Scripts

### cleanup.sh
Removes validator and relayer databases to start fresh.

```bash
./scripts/cleanup.sh
```

Effects:
- Removes `source/hyperlane_db/*`
- Removes `relayer/hyperlane_db/*`
- Keeps `.gitkeep` files for version control

### create-core-config.sh
Generates Hyperlane core deployment configurations using environment variables.

```bash
./scripts/create-core-config.sh
```

Output:
- `../../hyperlane/chains/source/core-config.yaml`
- `../../hyperlane/chains/destination/core-config.yaml`

### create-warp-route-config.sh
Generates warp route deployment configurations.

```bash
./scripts/create-warp-route-config.sh
```

Output:
- `../../hyperlane/deployments/warp_routes/ETH/destination-deploy.yaml`
- `../../hyperlane/deployments/warp_routes/ETH/source-deploy.yaml`

### update-agent-config.sh
Generates agent configuration by substituting environment variables into the template.

```bash
./scripts/update-agent-config.sh
```

Output:
- `config/agent.json` (should be .gitignored)

## Docker Services

### source-validator
Hyperlane validator agent that validates messages from source chain.

**Metrics**: `http://localhost:9090/metrics`

**Logs**:
```bash
docker-compose logs -f source-validator
```

**Health Check**:
```bash
curl http://localhost:9090/metrics
```

### relayer
Hyperlane relayer that delivers validated messages to destination chain.

**Metrics**: `http://localhost:9091/metrics`

**Logs**:
```bash
docker-compose logs -f relayer
```

**Health Check**:
```bash
curl http://localhost:9091/metrics
```

## Common Tasks

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f source-validator
docker-compose logs -f relayer

# Last 50 lines
docker-compose logs --tail=50
```

### Restart Services

```bash
docker-compose restart
```

### Clean and Restart

```bash
# Stop services
docker-compose down

# Clean databases
./scripts/cleanup.sh

# Regenerate configs
./scripts/update-agent-config.sh

# Start fresh
docker-compose up -d
```

### Check Service Health

```bash
# Docker health status
docker-compose ps

# Service metrics
curl -s http://localhost:9090/metrics | head -20
curl -s http://localhost:9091/metrics | head -20
```

## Troubleshooting

### Services Not Starting

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Verify configuration:
   ```bash
   cat config/agent.json
   ```

3. Ensure environment variables are set:
   ```bash
   source .env
   env | grep -i deployer
   ```

### Database Connection Errors

1. Verify RPC endpoints are accessible:
   ```bash
   curl -X POST http://localhost:8547 \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. Check validator account balance:
   ```bash
   curl -X POST http://localhost:8547 \
     -H "Content-Type: application/json" \
     -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$VALIDATOR_ADDRESS\",\"latest\"],\"id\":1}"
   ```

### Config Generation Failures

1. Verify .env exists:
   ```bash
   ls -la .env
   source .env
   ```

2. Check template files:
   ```bash
   ls -la templates/
   ls -la config/
   ```

3. Verify directory structure:
   ```bash
   mkdir -p source/hyperlane_db
   mkdir -p relayer/hyperlane_db
   mkdir -p ../../hyperlane/chains/{source,destination}
   mkdir -p ../../hyperlane/deployments/warp_routes/ETH
   ```

### Metrics Endpoint Not Responding

1. Check if services are running:
   ```bash
   docker ps | grep hyperlane
   ```

2. Verify port mapping:
   ```bash
   netstat -an | grep 909
   ```

3. Check container logs for startup errors:
   ```bash
   docker logs source-validator
   docker logs relayer
   ```

## Environment Variable Reference

| Variable | Example | Purpose |
|----------|---------|---------|
| SERVICE_NAME | "source" | Service identifier |
| DEPLOYER_KEY | "0xac09..." | Deploy contracts |
| DEPLOYER_ADDRESS | "0xf39F..." | Deployer account address |
| SOURCE_CHAIN_RPC_URL | "http://localhost:8547" | Source chain endpoint |
| DESTINATION_CHAIN_RPC_URL | "http://localhost:8549" | Destination chain endpoint |
| VALIDATOR_KEY | "0xdbda..." | Validate messages |
| VALIDATOR_ADDRESS | "0x2361..." | Validator account address |
| PROXY_ADMIN_ADDRESS | "0xf39F..." | Admin for upgradeable contracts |

## Security Considerations

1. **Private Keys**: Never commit `.env` or `agent.json` to version control
2. **Access Control**: Use `.env` files with restrictive permissions
3. **Docker Security**: Consider using `seccomp:unconfined` only in development
4. **Network**: Use separate validator and deployer accounts in production
5. **Backups**: Back up `hyperlane_db` directories regularly

## References

- [Hyperlane Documentation](https://docs.hyperlane.xyz/)
- [Hyperlane Agent Configuration](https://docs.hyperlane.xyz/operators/run-validators)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Hyperlane CLI](https://github.com/hyperlane-xyz/hyperlane-monorepo)

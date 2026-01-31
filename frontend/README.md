# ApeGate Frontend

Minimal Next.js app demonstrating the flow:

- Connect MetaMask (Sepolia)
- Buy a ticket (call `ApeGatePayment.buyTicket`)
- Poll ApeChain Curtis for minted NFT
- Show QR code (tokenId + wallet address) for IRL check-in

Run:

1. cd frontend
2. npm install
3. copy `.env.example` to `.env.local` and fill addresses
4. npm run dev

The app intentionally keeps logic minimal to demonstrate the full E2E cross-chain mint.

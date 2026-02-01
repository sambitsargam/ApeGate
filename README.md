# ApeGate — Pay anywhere. Enter instantly. 🚀

**ApeGate** is a decentralized event ticketing platform that revolutionizes how users buy event tickets and how organizers create and manage events. With instant NFT ticket delivery via cross-chain messaging, users get instant entry to events while organizers maintain complete control over their event lifecycle.

## 🎯 Overview

ApeGate combines blockchain technology with a user-friendly interface to create a seamless event ticketing experience:

- **Instant Ticket Delivery**: Buy a ticket on Anvil (source chain), instantly receive an NFT on ApeChain Gary (destination chain)
- **Cross-Chain Finality**: Leverages Espresso's finality without waiting for L1 confirmation via Caff Nodes
- **Event Management**: Users can create, manage, and promote their own events
- **Real NFTs**: Every ticket is an ERC-721 NFT with metadata and proof of ownership
- **Low-Cost Entry**: Use local Anvil for development (no faucet needed)

## ✨ Key Features

### For Ticket Buyers
✅ **Instant Ticket Purchase** - Buy tickets on Anvil, receive NFT on ApeChain instantly  
✅ **Event Discovery** - Browse and discover upcoming events  
✅ **QR Code Check-in** - Use generated QR codes for event entry  
✅ **NFT Ownership** - Tickets are real ERC-721 NFTs you own and can trade  
✅ **Cross-Chain Support** - Seamless cross-chain transaction handling  

### For Event Organizers
✅ **Event Creation** - Create your own events with comprehensive details (name, date, location, capacity, ticket price)  
✅ **Event Management** - View, edit, and delete your created events  
✅ **Audience Management** - See who purchased tickets to your event  
✅ **Revenue Tracking** - Monitor ticket sales and revenue  
✅ **Event Privacy** - Control whether events are public or private  
✅ **Metadata Management** - Add descriptions, categories, and images to events  

### Platform Features
✅ **Web3 Native** - MetaMask integration for wallet management  
✅ **Real-Time Updates** - Event and ticket data synced with smart contracts  
✅ **Responsive Design** - Works seamlessly on desktop and mobile  
✅ **Error Handling** - Comprehensive error messages and recovery  
✅ **Production Ready** - Verified builds and tested flows  

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **Framework**: Next.js 12.3.1 with React 17.0.2
- **Styling**: Tailwind CSS 3.4.1
- **Web3**: ethers.js 5.7.0 for blockchain interaction
- **State Management**: React Hooks (useState, useEffect)
- **UI Components**: Custom Tailwind components with gradient overlays

**Smart Contracts:**
- **Language**: Solidity 0.8.17
- **Networks**: 
  - Source: Anvil (local testnet for ticket purchase)
  - Destination: ApeChain Gary (testnet for NFT minting)
- **Cross-Chain**: Hyperlane for message relay, Espresso for finality

**Infrastructure:**
- **Validator/Relayer**: Hyperlane infrastructure for cross-chain communication
- **Finality**: Espresso Caff Nodes for fast state confirmation
- **Local Development**: Anvil (Foundry) for local blockchain

### Project Structure

```
/ApeGate
├── /frontend                          # Next.js application
│   ├── /pages
│   │   ├── index.jsx                 # Landing page with navigation
│   │   ├── buy.jsx                   # Ticket purchase flow
│   │   ├── checkin.jsx               # Event check-in with QR codes
│   │   ├── create-event.jsx           # Event creation form
│   │   ├── my-events.jsx              # User's event management
│   │   └── /event
│   │       └── [id].jsx              # Dynamic event detail page
│   ├── /public                        # Static assets
│   ├── /styles                        # Global CSS and Tailwind config
│   └── package.json
├── /src
│   ├── EventManager.sol              # Event creation and management
│   ├── TicketNFT.sol                 # Ticket NFT contract
│   └── /test
├── /anvil                            # Anvil configuration and scripts
│   ├── docker-compose.yml            # Docker setup
│   ├── run-anvil.sh                  # Start local blockchain
│   └── deploy.sh                     # Deploy contracts
├── /docs                             # Documentation
├── LICENSE                           # MIT License
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MetaMask browser extension
- Foundry (for Anvil)
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository**
```bash
cd /Users/sambit/Desktop/ApeGate
git clone <repository-url>
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Configure environment variables**
Create a `.env.local` file in `/frontend`:
```env
NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=0x...  # EventManager contract address
NEXT_PUBLIC_TICKET_NFT_ADDRESS=0x...     # TicketNFT contract address
NEXT_PUBLIC_APECHAIN_RPC=https://...     # ApeChain Gary RPC endpoint
NEXT_PUBLIC_ANVIL_RPC=http://localhost:8545
```

4. **Start local blockchain**
```bash
cd /anvil
./run-anvil.sh
```

5. **Deploy smart contracts**
```bash
cd /anvil
./deploy.sh
```

6. **Run frontend development server**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 User Guides

### Creating an Event

1. **Connect Wallet**
   - Click "Create Event" in the header
   - Click "Connect Wallet" button
   - Approve MetaMask connection

2. **Fill Event Details**
   - **Event Name**: Memorable event title
   - **Event Date**: When the event occurs
   - **Location**: Physical or virtual location
   - **Description**: Detailed event information
   - **Capacity**: Maximum ticket quantity
   - **Ticket Price**: Price per ticket in ETH
   - **Category**: Event type (concert, conference, meetup, etc.)
   - **Privacy**: Public (discoverable) or Private

3. **Upload Event Image** (Optional)
   - Click image upload button
   - Select image from device
   - Image is stored with event metadata

4. **Create Event**
   - Click "Create Event" button
   - Approve MetaMask transaction
   - Event appears in smart contract and MyEvents page

### Managing Your Events

1. **View Your Events**
   - Go to "My Events" page
   - See all events you've created
   - View statistics: total sales, upcoming events

2. **Edit Event**
   - Click "Edit" on any event card
   - Modify event details
   - Save changes (updates contract)

3. **Delete Event**
   - Click "Delete" on event card
   - Confirm deletion
   - Event removed from contract

4. **View Analytics**
   - See ticket sales per event
   - Track attendees
   - Monitor event status

### Buying Tickets

1. **Browse Events**
   - Visit landing page or event detail page
   - View event information

2. **Purchase Tickets**
   - Click "Buy Tickets" or quantity selector
   - Confirm number of tickets
   - Approve payment in MetaMask
   - Transaction processed on Anvil

3. **Receive NFT**
   - Hyperlane relays ticket data to ApeChain
   - Ticket NFT automatically minted
   - Confirm in your wallet

4. **Check In**
   - Go to "Check In" page
   - Scan QR code or enter event code
   - Access granted to event

## 💻 Smart Contracts

### EventManager.sol

Manages event creation, storage, and lifecycle:

```solidity
struct Event {
    uint256 eventId;
    string name;
    string description;
    uint256 eventDate;
    string location;
    uint256 capacity;
    uint256 ticketPrice;
    address organizer;
    uint256 ticketsIssued;
    bool isActive;
    string imageURI;
    string category;
    bool isPublic;
    uint256 createdAt;
}
```

**Key Functions:**

| Function | Purpose | Access |
|----------|---------|--------|
| `createEvent()` | Create new event | Public |
| `getEvent(id)` | Retrieve event details | Public |
| `getUserEvents(address)` | Get user's events | Public |
| `updateEvent()` | Modify event details | Organizer only |
| `deleteEvent()` | Remove event | Organizer only |
| `issuedTickets()` | Count tickets for event | Public |

**Events Emitted:**
- `EventCreated(eventId, organizer, name, date)`
- `EventUpdated(eventId, timestamp)`
- `EventDeleted(eventId)`
- `TicketIssued(eventId, to, count)`

### TicketNFT.sol

ERC-721 contract for ticket NFTs:

```solidity
struct TicketMetadata {
    uint256 eventId;
    address holder;
    uint256 purchaseDate;
    bool usedForCheckIn;
    string qrCodeHash;
}
```

**Key Functions:**
- `mintTicket(to, eventId)` - Mint ticket NFT
- `getTicketMetadata(tokenId)` - View ticket details
- `markCheckIn(tokenId)` - Record event entry
- `isValidTicket(tokenId, eventId)` - Verify ticket authenticity

## 🔗 Cross-Chain Flow

### Ticket Purchase Transaction Flow

```
1. User buys ticket on Anvil
   ↓
2. TicketNFT contract calls Hyperlane Mailbox.dispatch()
   ↓
3. Hyperlane Validator signs message
   ↓
4. Relayer picks up signed message
   ↓
5. Message routed to ApeChain Gary
   ↓
6. Destination Mailbox delivers message to TicketNFT ISM
   ↓
7. TicketNFT.handle() mints NFT to recipient
   ↓
8. User receives ticket NFT on ApeChain instantly
```

### Why Espresso Finality?

- **Fast Confirmation**: Don't wait for L1 finality
- **Caff Nodes**: Access Espresso's confirmed state immediately
- **Presto Integration**: Seamless state availability
- **Low Latency**: Instant ticket delivery

## 🧪 Testing

### Frontend Build Verification

Verify all pages compile successfully:

```bash
cd frontend
npm run build
```

**Expected Output:**
```
info  - Compiled successfully

┌ ○ /                                      2.21 kB
├   /_app                                  0 B
├ ○ /404                                   194 B
├ ○ /buy                                   4.01 kB
├ ○ /checkin                               2.97 kB
├ ○ /create-event                          3.25 kB
├ ○ /event/[id]                            3.73 kB
└ ○ /my-events                             2.74 kB

First Load JS: 80.2 kB
```

### Smart Contract Testing

```bash
cd /src
# Test EventManager functions
forge test

# Test TicketNFT contract
forge test --match-path "**/test/TicketNFT.t.sol"
```

### Manual Testing Checklist

- [ ] Create event with all details
- [ ] View created event in My Events page
- [ ] Edit event details
- [ ] Delete event with confirmation
- [ ] Purchase ticket from event detail page
- [ ] Receive NFT on ApeChain
- [ ] Check in with QR code
- [ ] Search and filter events
- [ ] MetaMask wallet integration working
- [ ] Error messages display correctly

## 📦 Deployment

### Deploy to Testnet

1. **Set environment variables**
```bash
export PRIVATE_KEY=your_private_key
export APECHAIN_RPC_URL=https://apechain-gary.api.node.apelabs.com
export ANVIL_RPC_URL=http://localhost:8545
```

2. **Deploy EventManager**
```bash
cd /src
forge create EventManager \
  --rpc-url $APECHAIN_RPC_URL \
  --private-key $PRIVATE_KEY
```

3. **Deploy TicketNFT**
```bash
forge create TicketNFT \
  --rpc-url $APECHAIN_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args "0x..." # EventManager address
```

4. **Update frontend environment**
```bash
# .env.local
NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=<deployed-address>
NEXT_PUBLIC_TICKET_NFT_ADDRESS=<deployed-address>
```

5. **Deploy frontend**
```bash
cd frontend
npm run build
npm run start
```

## 🔧 Configuration

### Anvil Configuration

Edit `/anvil/docker-compose.yml`:

```yaml
services:
  anvil:
    image: ghcr.io/foundry-rs/foundry:latest
    command: anvil --host 0.0.0.0 --port 8545
    ports:
      - "8545:8545"
```

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=0x...      # EventManager contract
NEXT_PUBLIC_TICKET_NFT_ADDRESS=0x...         # TicketNFT contract
NEXT_PUBLIC_APECHAIN_RPC=https://apechain... # ApeChain RPC
NEXT_PUBLIC_ANVIL_RPC=http://localhost:8545  # Local blockchain
NEXT_PUBLIC_HYPERLANE_DOMAIN_ANVIL=31337     # Anvil domain
NEXT_PUBLIC_HYPERLANE_DOMAIN_APECHAIN=31338  # ApeChain domain
```

## 🐛 Troubleshooting

### "MetaMask not found" Error

**Problem**: Extension not installed or not connected  
**Solution**:
1. Install MetaMask from Chrome Web Store
2. Reload page
3. Click "Connect Wallet"

### "Contract call failed" Error

**Problem**: Contract address not deployed or incorrect RPC  
**Solution**:
1. Verify contract deployed: `forge verify-contract <address>`
2. Check RPC endpoint in .env.local
3. Ensure you're on correct network in MetaMask

### Ticket NFT not minting on ApeChain

**Problem**: Hyperlane relayer not running  
**Solution**:
1. Check relayer status in `/anvil/logs/relayer.log`
2. Restart relayer: `./run-relayer.sh`
3. Check Espresso node connectivity

### Event not appearing in My Events

**Problem**: Event contract state not synced  
**Solution**:
1. Refresh page (reload React state)
2. Check MetaMask connected to correct address
3. Verify EventManager contract address in .env.local
4. Check contract on block explorer

### Build fails with "Module not found"

**Problem**: Dependencies not installed  
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Additional Resources

- **Hyperlane Docs**: https://docs.hyperlane.xyz
- **Espresso Docs**: https://docs.espressosys.io
- **ethers.js Docs**: https://docs.ethers.io
- **Solidity Docs**: https://docs.soliditylang.org
- **Next.js Docs**: https://nextjs.org/docs

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hyperlane** - Cross-chain messaging infrastructure
- **Espresso** - Fast finality for state confirmation
- **Foundry** - Smart contract development toolkit
- **Next.js** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework

## 📧 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check troubleshooting section above
- Review documentation in `/docs`
- Contact maintainers

---

**ApeGate** — Making event ticketing decentralized, instant, and secure. 🚀


import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState('');
  const [dispatchId, setDispatchId] = useState(null);
  const [processId, setProcessId] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  const paymentAddress = process.env.NEXT_PUBLIC_PAYMENT_ADDRESS;
  const nftPrice = process.env.NEXT_PUBLIC_TICKET_PRICE_WEI || '1000000000000000'; // 0.001 native token
  const apechainRpc = process.env.NEXT_PUBLIC_APECHAIN_RPC;
  const ticketNftAddress = process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS;

  async function connectWallet() {
    if (!window.ethereum) return alert('Install MetaMask');
    const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(acc);
  }

  async function buyTicket() {
    if (!account) return alert('Connect wallet');
    setStatus('Initiating cross-chain NFT purchase...');
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const paymentAbi = [
        'event TransferRemote(uint32 indexed destination, bytes32 indexed recipient, uint256 amount)',
        'function initiateCrossChainNftPurchase(address nftRecipient) payable returns (bytes32)'
      ];
      
      const contract = new ethers.Contract(paymentAddress, paymentAbi, signer);

      // Listen for TransferRemote event (source chain evidence)
      contract.once('TransferRemote', (destination, recipient, amount) => {
        const dispatchId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['uint32', 'bytes32', 'uint256'], [destination, recipient, amount])
        );
        setDispatchId(dispatchId);
        setStatus('✅ Payment submitted & message dispatched to Hyperlane Mailbox. Waiting for relayer delivery...');
      });

      // Send transaction
      const tx = await contract.initiateCrossChainNftPurchase(account, { value: nftPrice });
      await tx.wait();

      // Now poll ApeChain for ProcessId event matching our DispatchId
      setStatus('Polling ApeChain Gary for minted NFT...');
      
      const apeProvider = new ethers.providers.JsonRpcProvider(apechainRpc);
      const nftAbi = [
        'event TicketMinted(address indexed to, uint256 indexed eventId, uint256 indexed tokenId)',
        'function balanceOf(address owner) view returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ];
      
      const nft = new ethers.Contract(ticketNftAddress, nftAbi, apeProvider);

      // Listen for TicketMinted event on destination
      nft.once('TicketMinted', (to, eventId, tokenId) => {
        if (to.toLowerCase() === account.toLowerCase()) {
          setProcessId(tokenId.toString());
          setStatus('✅ NFT Minted on ApeChain Gary! Access Granted.');
        }
      });

      // Fallback: poll for ownership
      const start = Date.now();
      while (Date.now() - start < 120_000) { // 2 minute timeout
        try {
          const bal = await nft.balanceOf(account);
          if (bal && bal.toNumber() > 0) {
            const tokenId = await nft.tokenOfOwnerByIndex(account, 0);
            const uri = await nft.tokenURI(tokenId);
            setTokenInfo({ tokenId: tokenId.toString(), uri });
            setProcessId(tokenId.toString());
            setStatus('✅ NFT received on ApeChain Gary! Access Granted.');
            return;
          }
        } catch (e) {
          // ignore: NFT may not exist yet
        }
        await new Promise(r => setTimeout(r, 5000));
      }

      setStatus('⏱️ Timeout: NFT not received. Check relayer status.');
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
    }
  }

  function qrUrl() {
    if (!tokenInfo || !account) return null;
    const payload = `token:${tokenInfo.tokenId};owner:${account}`;
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(payload)}`;
  }

  return (
    <div style={{padding: 20, fontFamily: 'monospace'}}>
      <h1>🚀 ApeGate — Pay anywhere. Enter instantly.</h1>
      <p><em>Powered by Espresso finality + Presto + Hyperlane</em></p>
      
      <div style={{marginBottom: 20}}>
        {account ? (
          <div>✅ Connected: <code>{account.slice(0, 6)}...{account.slice(-4)}</code></div>
        ) : (
          <button onClick={connectWallet} style={{padding: '10px 20px', fontSize: 14}}>
            Connect MetaMask (Local Anvil)
          </button>
        )}
      </div>

      <div style={{marginBottom: 20}}>
        <button onClick={buyTicket} style={{padding: '10px 20px', fontSize: 14, background: '#00d4ff', color: 'black', border: 'none', cursor: 'pointer'}}>
          Buy Ticket (0.001 native)
        </button>
      </div>

      <div style={{background: '#f0f0f0', padding: 15, borderRadius: 5, marginBottom: 20}}>
        <div><strong>Status:</strong> {status || 'Ready'}</div>
        {dispatchId && <div><strong>DispatchId:</strong> <code>{dispatchId.slice(0, 16)}...</code></div>}
        {processId && <div><strong>ProcessId (TokenId):</strong> <code>{processId}</code></div>}
      </div>

      {tokenInfo && (
        <div style={{background: '#f0f0f0', padding: 15, borderRadius: 5}}>
          <h3>🎫 Your Ticket</h3>
          <div>TokenId: <code>{tokenInfo.tokenId}</code></div>
          <div><a href={tokenInfo.uri} target="_blank" rel="noreferrer">View Metadata</a></div>
          {qrUrl() && <div><img src={qrUrl()} alt="QR Code" style={{width: 200, marginTop: 10}}/></div>}
        </div>
      )}
    </div>
  );
}

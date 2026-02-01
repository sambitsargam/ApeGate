import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ethers } from 'ethers';

export default function BuyTicket() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState('');
  const [dispatchId, setDispatchId] = useState(null);
  const [processId, setProcessId] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentAddress = process.env.NEXT_PUBLIC_PAYMENT_ADDRESS;
  const nftPrice = process.env.NEXT_PUBLIC_TICKET_PRICE_WEI || '1000000000000000';
  const apechainRpc = process.env.NEXT_PUBLIC_APECHAIN_RPC;
  const ticketNftAddress = process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  async function connectWallet() {
    if (typeof window === 'undefined') {
      alert('Window object not available');
      return;
    }
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install it: https://metamask.io');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setStatus('✅ Wallet connected!');
      }
    } catch (e) {
      console.error('Connection error:', e);
      setStatus(`❌ Connection failed: ${e.message}`);
    }
  }

  async function buyTicket() {
    if (!account) return alert('Connect wallet first');
    if (typeof window === 'undefined' || !window.ethereum) return alert('MetaMask not available');
    setLoading(true);
    setStatus('⏳ Initiating cross-chain NFT purchase...');
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const paymentAbi = [
        'event TransferRemote(uint32 indexed destination, bytes32 indexed recipient, uint256 amount)',
        'function initiateCrossChainNftPurchase(address nftRecipient) payable returns (bytes32)'
      ];
      
      const contract = new ethers.Contract(paymentAddress, paymentAbi, signer);

      contract.once('TransferRemote', (destination, recipient, amount) => {
        const dispatchId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(['uint32', 'bytes32', 'uint256'], [destination, recipient, amount])
        );
        setDispatchId(dispatchId);
        setStatus('✅ Payment submitted! Message dispatched to Hyperlane. Waiting for relayer delivery...');
      });

      const tx = await contract.initiateCrossChainNftPurchase(account, { value: nftPrice });
      await tx.wait();

      setStatus('⏳ Polling ApeChain Gary for minted NFT...');
      
      const apeProvider = new ethers.providers.JsonRpcProvider(apechainRpc);
      const nftAbi = [
        'event TicketMinted(address indexed to, uint256 indexed eventId, uint256 indexed tokenId)',
        'function balanceOf(address owner) view returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ];
      
      const nft = new ethers.Contract(ticketNftAddress, nftAbi, apeProvider);

      const start = Date.now();
      while (Date.now() - start < 120_000) {
        try {
          const bal = await nft.balanceOf(account);
          if (bal && bal.toNumber() > 0) {
            const tokenId = await nft.tokenOfOwnerByIndex(account, 0);
            const uri = await nft.tokenURI(tokenId);
            setTokenInfo({ tokenId: tokenId.toString(), uri });
            setProcessId(tokenId.toString());
            setStatus('✅ NFT Minted on ApeChain Gary! 🎉');
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore
        }
        await new Promise(r => setTimeout(r, 5000));
      }

      setStatus('⏱️ Timeout waiting for NFT. Check relayer status.');
      setLoading(false);
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
      setLoading(false);
    }
  }

  function qrUrl() {
    if (!tokenInfo || !account) return null;
    const payload = `token:${tokenInfo.tokenId};owner:${account}`;
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(payload)}`;
  }

  return (
    <>
      <Head>
        <title>Buy Tickets - ApeGate</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-black/30 backdrop-blur-md border-b border-cyan-500/20">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-black gradient-text cursor-pointer">🐵 ApeGate</h1>
            </Link>
            {mounted && (
              <div className="space-x-4">
                {account ? (
                  <span className="text-cyan-400 font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                ) : (
                  <button type="button" className="btn-primary" onClick={connectWallet}>Connect Wallet</button>
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            {mounted ? (
              <>
                {/* Main Card */}
                <div className="card">
                  <h1 className="text-4xl font-black mb-2 gradient-text">Get Your NFT Ticket</h1>
                  <p className="text-gray-300 mb-8">Secure your spot instantly with cross-chain finality</p>

                  {/* Wallet Status */}
                  <div className="mb-8 p-4 border border-cyan-500/30 rounded-lg bg-cyan-900/20">
                    {account ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Connected: <span className="font-bold text-cyan-400">{account.slice(0, 6)}...{account.slice(-4)}</span></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⚠</span>
                        <span className="text-gray-300">Connect wallet to continue</span>
                      </div>
                    )}
                  </div>

                  {/* Purchase Section */}
                  {!processId ? (
                    <div>
                      {/* Price Display */}
                      <div className="mb-8 p-4 border border-cyan-500/30 rounded-lg bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
                    <p className="text-gray-400 text-sm mb-2">Ticket Price</p>
                    <div className="text-3xl font-black gradient-text">0.001 native token</div>
                    <p className="text-gray-400 text-sm mt-2">✨ Instant delivery to ApeChain Gary</p>
                  </div>

                  {/* Status Display */}
                  {status && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                      status.includes('✅') 
                        ? 'border-green-500/30 bg-green-900/20 text-green-300'
                        : status.includes('❌')
                        ? 'border-red-500/30 bg-red-900/20 text-red-300'
                        : 'border-cyan-500/30 bg-cyan-900/20 text-cyan-300'
                    }`}>
                      {status}
                    </div>
                  )}

                  {/* IDs Display */}
                  {dispatchId && (
                    <div className="mb-6 p-4 border border-purple-500/30 rounded-lg bg-purple-900/20">
                      <p className="text-gray-400 text-xs mb-1">Dispatch ID (Source Chain Evidence)</p>
                      <p className="text-purple-300 font-mono text-sm break-all">{dispatchId.slice(0, 32)}...</p>
                    </div>
                  )}

                  {/* Buy Button */}
                  <button
                    onClick={buyTicket}
                    disabled={!account || loading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                      account && !loading
                        ? 'btn-primary cursor-pointer hover:scale-105'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? '⏳ Processing...' : '🎫 Buy Ticket Now'}
                  </button>

                  {!account && (
                    <button
                      type="button"
                      onClick={connectWallet}
                      className="w-full mt-4 py-4 px-6 rounded-lg font-bold text-lg btn-secondary"
                    >
                      Connect Wallet First
                    </button>
                  )}
                    </div>
                  ) : (
                    /* Success State */
                    <div className="text-center">
                      <div className="mb-8 p-6 border border-green-500/30 rounded-lg bg-green-900/20">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-green-300 mb-2">Success!</h2>
                        <p className="text-gray-300">Your NFT ticket has been minted</p>
                      </div>

                      {/* NFT Details */}
                      <div className="mb-8 space-y-4">
                    <div className="p-4 border border-cyan-500/30 rounded-lg bg-cyan-900/20">
                      <p className="text-gray-400 text-sm mb-1">Token ID</p>
                      <p className="text-cyan-300 font-mono font-bold">{processId}</p>
                    </div>

                    {qrUrl() && (
                      <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-900/20">
                        <p className="text-gray-400 text-sm mb-3">Check-in QR Code</p>
                        <img src={qrUrl()} alt="QR Code" className="mx-auto w-40 h-40 rounded" />
                      </div>
                    )}

                    {tokenInfo && (
                      <a
                        href={tokenInfo.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block btn-secondary px-6 py-2 text-sm"
                      >
                        📄 View Metadata
                      </a>
                    )}
                      </div>

                      {/* Next Steps */}
                      <div className="p-4 border border-cyan-500/30 rounded-lg bg-cyan-900/20 text-left">
                        <p className="text-gray-400 text-sm mb-2 font-bold">Next Steps:</p>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>✓ Save your token ID for check-in</li>
                          <li>✓ Screenshot or download the QR code</li>
                          <li>✓ View the event details in your metadata</li>
                        </ul>
                      </div>

                      <Link href="/">
                        <button className="w-full mt-8 btn-secondary py-3 rounded-lg font-bold">
                          ← Back to Home
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Info Cards */}
                <div className="mt-12 grid md:grid-cols-3 gap-4">
                  {[
                    { icon: '🔒', title: 'Secure', desc: 'Powered by Hyperlane & Espresso' },
                    { icon: '⚡', title: 'Instant', desc: 'NFT in your wallet within seconds' },
                    { icon: '🌍', title: 'Multi-Chain', desc: 'Pay from any supported network' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 border border-cyan-500/20 rounded-lg bg-black/30 text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <h3 className="font-bold text-cyan-300 mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">⏳</div>
                <p className="text-gray-300">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

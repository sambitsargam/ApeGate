import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ethers } from 'ethers';

export default function CheckIn() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState({});

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
        await loadTickets(accounts[0]);
      }
    } catch (e) {
      console.error('Connection error:', e);
      alert(`Connection failed: ${e.message}`);
    }
  }

  async function loadTickets(addr) {
    if (!addr) return;
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(apechainRpc);
      const nftAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ];
      
      const nft = new ethers.Contract(ticketNftAddress, nftAbi, provider);
      const balance = await nft.balanceOf(addr);
      
      const ticketList = [];
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await nft.tokenOfOwnerByIndex(addr, i);
        const uri = await nft.tokenURI(tokenId);
        ticketList.push({ tokenId: tokenId.toString(), uri });
      }
      setTickets(ticketList);
    } catch (e) {
      alert(`Failed to load tickets: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function checkInTicket(tokenId) {
    setCheckedIn(prev => ({ ...prev, [tokenId]: true }));
    setTimeout(() => {
      setCheckedIn(prev => {
        const newState = { ...prev };
        delete newState[tokenId];
        return newState;
      });
    }, 3000);
  }

  function qrUrl(tokenId) {
    if (!account) return null;
    const payload = `token:${tokenId};owner:${account}`;
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(payload)}`;
  }

  return (
    <>
      <Head>
        <title>Check In - ApeGate</title>
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black mb-2 gradient-text text-center">Check In</h1>
            <p className="text-gray-300 text-center mb-12">Verify your NFT tickets for event entry</p>

            {mounted ? (
            <>
            {!account ? (
              <div className="card text-center">
                <div className="text-6xl mb-6">🎫</div>
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-6">Connect to ApeChain Gary to view your NFT tickets</p>
                <button type="button" onClick={connectWallet} className="btn-primary px-12 py-4 text-lg">
                  Connect Wallet
                </button>
              </div>
            ) : loading ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4 animate-spin">⏳</div>
                <p className="text-gray-300">Loading your tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="card text-center">
                <div className="text-6xl mb-6">📭</div>
                <h2 className="text-2xl font-bold mb-4">No Tickets Found</h2>
                <p className="text-gray-300 mb-6">You don't have any NFT tickets yet</p>
                <Link href="/buy">
                  <button className="btn-primary px-12 py-4 text-lg">
                    Buy Your First Ticket
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tickets Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {tickets.map((ticket, i) => (
                    <div key={i} className="card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Token ID</p>
                          <p className="text-cyan-400 font-mono font-bold">{ticket.tokenId}</p>
                        </div>
                        <div className="text-3xl">🎭</div>
                      </div>

                      {checkedIn[ticket.tokenId] ? (
                        <div className="p-4 border border-green-500/30 rounded-lg bg-green-900/20 mb-4">
                          <div className="text-center">
                            <div className="text-4xl mb-2">✅</div>
                            <p className="text-green-300 font-bold">Access Granted!</p>
                            <p className="text-green-300/70 text-sm mt-1">Welcome to the event</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-4 border border-cyan-500/30 rounded-lg bg-cyan-900/20">
                          <p className="text-gray-400 text-xs mb-3">Check-in QR Code</p>
                          <img src={qrUrl(ticket.tokenId)} alt={`QR ${ticket.tokenId}`} className="w-full rounded" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => checkInTicket(ticket.tokenId)}
                          disabled={checkedIn[ticket.tokenId]}
                          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                            checkedIn[ticket.tokenId]
                              ? 'bg-green-600 text-white'
                              : 'btn-primary'
                          }`}
                        >
                          {checkedIn[ticket.tokenId] ? '✅ Checked In' : '🚪 Check In'}
                        </button>
                        <a
                          href={ticket.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 rounded-lg font-bold btn-secondary text-center text-sm"
                        >
                          📄
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="p-6 border border-cyan-500/20 rounded-lg bg-cyan-900/10">
                  <h3 className="font-bold text-cyan-300 mb-3">How to Check In:</h3>
                  <ol className="text-gray-300 space-y-2 text-sm">
                    <li className="flex gap-3"><span className="text-cyan-400">1.</span> Tap "Check In" button above</li>
                    <li className="flex gap-3"><span className="text-cyan-400">2.</span> Show the QR code to event staff</li>
                    <li className="flex gap-3"><span className="text-cyan-400">3.</span> Your access will be verified instantly</li>
                    <li className="flex gap-3"><span className="text-cyan-400">4.</span> Enjoy the event! 🎉</li>
                  </ol>
                </div>

                {/* Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border border-cyan-500/20 rounded-lg bg-black/30 text-center">
                    <p className="text-gray-400 text-sm mb-1">Total Tickets</p>
                    <p className="text-3xl font-black gradient-text">{tickets.length}</p>
                  </div>
                  <div className="p-4 border border-green-500/20 rounded-lg bg-black/30 text-center">
                    <p className="text-gray-400 text-sm mb-1">Checked In</p>
                    <p className="text-3xl font-black text-green-400">{Object.keys(checkedIn).length}</p>
                  </div>
                  <div className="p-4 border border-purple-500/20 rounded-lg bg-black/30 text-center">
                    <p className="text-gray-400 text-sm mb-1">Network</p>
                    <p className="text-lg font-bold text-purple-400">ApeChain Gary</p>
                  </div>
                </div>
              </div>
            )}
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

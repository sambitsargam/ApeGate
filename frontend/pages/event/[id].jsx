import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [ticketsToBook, setTicketsToBook] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id && mounted) {
      loadEvent();
    }
  }, [id, mounted]);

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

  function loadEvent() {
    try {
      const allEvents = localStorage.getItem('apeGateEvents');
      if (allEvents) {
        const events = JSON.parse(allEvents);
        const foundEvent = events.find(e => e.id === parseInt(id));
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setStatus('❌ Event not found');
        }
      }
    } catch (e) {
      console.error('Error loading event:', e);
      setStatus('❌ Error loading event');
    }
  }

  async function buyTickets(e) {
    e.preventDefault();

    if (!account) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    if (ticketsToBook < 1 || ticketsToBook > (event.ticketsAvailable - event.ticketsSold)) {
      setStatus('❌ Invalid number of tickets');
      return;
    }

    setLoading(true);
    setStatus('⏳ Processing ticket purchase...');

    try {
      // Simulate buying tickets
      const totalPrice = (ticketsToBook * parseFloat(event.ticketPrice)).toFixed(4);
      
      // Update event in localStorage
      const allEvents = localStorage.getItem('apeGateEvents');
      if (allEvents) {
        const events = JSON.parse(allEvents);
        const eventIndex = events.findIndex(e => e.id === event.id);
        if (eventIndex >= 0) {
          events[eventIndex].ticketsSold += ticketsToBook;
          localStorage.setItem('apeGateEvents', JSON.stringify(events));
          
          // Update local state
          setEvent({
            ...event,
            ticketsSold: event.ticketsSold + ticketsToBook
          });
        }
      }

      setStatus(`✅ Successfully purchased ${ticketsToBook} ticket(s) for ${totalPrice} ETH!`);
      setTicketsToBook(1);

      // Redirect to check-in page after 2 seconds
      setTimeout(() => {
        router.push('/checkin');
      }, 2000);

    } catch (e) {
      console.error('Error buying tickets:', e);
      setStatus(`❌ Failed to buy tickets: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <nav className="fixed w-full top-0 z-50 bg-black/30 backdrop-blur-md border-b border-cyan-500/20">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-black gradient-text cursor-pointer">🐵 ApeGate</h1>
            </Link>
          </div>
        </nav>
        
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-screen">
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="text-gray-300 mb-8">
              We couldn't find the event you're looking for.
            </p>
            <Link href="/">
              <button className="btn-primary inline-block">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
  const ticketSalePercentage = (event.ticketsSold / event.ticketsAvailable) * 100;
  const isSoldOut = ticketsRemaining === 0;

  return (
    <>
      <Head>
        <title>{event.eventName} - ApeGate</title>
        <meta name="description" content={event.description} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-black/30 backdrop-blur-md border-b border-cyan-500/20">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-black gradient-text cursor-pointer">🐵 ApeGate</h1>
            </Link>
            <div className="space-x-4 flex items-center">
              {account ? (
                <div className="text-sm text-cyan-400 font-mono bg-cyan-900/30 px-3 py-2 rounded">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={connectWallet}
                  className="btn-primary text-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Event Image */}
            {event.image && (
              <div className="mb-8 rounded-xl overflow-hidden h-96 mb-8">
                <img 
                  src={event.image} 
                  alt={event.eventName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Status Message */}
            {status && (
              <div className={`mb-6 p-4 rounded-lg border ${
                status.includes('✅') ? 'bg-green-900/30 border-green-500/50 text-green-300' :
                status.includes('❌') ? 'bg-red-900/30 border-red-500/50 text-red-300' :
                'bg-blue-900/30 border-blue-500/50 text-blue-300'
              }`}>
                {status}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {/* Event Info */}
              <div className="md:col-span-2">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full capitalize">
                      {event.category}
                    </span>
                    {isSoldOut && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <h1 className="text-5xl font-black mb-4">{event.eventName}</h1>
                  <p className="text-xl text-gray-300">{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="card mb-8 space-y-4">
                  <h2 className="text-2xl font-bold mb-6">📋 Event Details</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm text-gray-400 font-semibold mb-2">📅 Date</h3>
                      <p className="text-lg text-white">
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {event.eventTime && (
                      <div>
                        <h3 className="text-sm text-gray-400 font-semibold mb-2">🕐 Time</h3>
                        <p className="text-lg text-white">{event.eventTime}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm text-gray-400 font-semibold mb-2">📍 Location</h3>
                      <p className="text-lg text-white">{event.location || 'Virtual Event'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-400 font-semibold mb-2">💰 Price</h3>
                      <p className="text-lg text-white">{event.ticketPrice} ETH</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Sales Info */}
                <div className="card">
                  <h2 className="text-2xl font-bold mb-6">🎫 Ticket Sales</h2>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300">
                        {event.ticketsSold} / {event.ticketsAvailable} tickets sold
                      </span>
                      <span className="text-cyan-400 font-semibold">
                        {ticketSalePercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all"
                        style={{ width: `${ticketSalePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
                      <p className="text-sm text-gray-400 mb-1">Available</p>
                      <p className="text-2xl font-bold text-cyan-300">{ticketsRemaining}</p>
                    </div>
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                      <p className="text-sm text-gray-400 mb-1">Sold</p>
                      <p className="text-2xl font-bold text-green-300">{event.ticketsSold}</p>
                    </div>
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                      <p className="text-sm text-gray-400 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-purple-300">
                        {(event.ticketsSold * parseFloat(event.ticketPrice)).toFixed(2)} ETH
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Section */}
              <div className="md:col-span-1">
                <div className="card sticky top-32">
                  <h2 className="text-2xl font-bold mb-6">Get Your Tickets</h2>

                  {isSoldOut ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">😢</div>
                      <p className="text-lg font-semibold mb-4">Event Sold Out</p>
                      <p className="text-gray-300">All tickets have been purchased</p>
                    </div>
                  ) : (
                    <form onSubmit={buyTickets} className="space-y-6">
                      {/* Ticket Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Number of Tickets
                        </label>
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                          <button
                            type="button"
                            onClick={() => setTicketsToBook(Math.max(1, ticketsToBook - 1))}
                            disabled={loading || isSoldOut}
                            className="px-3 py-2 text-lg font-bold text-gray-300 hover:text-cyan-400 disabled:opacity-50"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={ticketsToBook}
                            onChange={(e) => setTicketsToBook(Math.min(ticketsRemaining, Math.max(1, parseInt(e.target.value) || 1)))}
                            min="1"
                            max={ticketsRemaining}
                            className="flex-1 bg-transparent text-center text-lg font-bold text-white outline-none"
                            disabled={loading || isSoldOut}
                          />
                          <button
                            type="button"
                            onClick={() => setTicketsToBook(Math.min(ticketsRemaining, ticketsToBook + 1))}
                            disabled={loading || isSoldOut}
                            className="px-3 py-2 text-lg font-bold text-gray-300 hover:text-cyan-400 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{ticketsRemaining} tickets available</p>
                      </div>

                      {/* Price Summary */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Unit Price</span>
                          <span className="text-white">{event.ticketPrice} ETH</span>
                        </div>
                        <div className="flex justify-between mb-4 pb-4 border-b border-gray-700">
                          <span className="text-gray-400">Quantity</span>
                          <span className="text-white">{ticketsToBook}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-300">Total</span>
                          <span className="text-2xl font-bold text-cyan-400">
                            {(ticketsToBook * parseFloat(event.ticketPrice)).toFixed(4)} ETH
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {!account ? (
                        <div>
                          <button
                            type="button"
                            onClick={connectWallet}
                            className="w-full btn-primary"
                          >
                            Connect Wallet
                          </button>
                          <p className="text-xs text-gray-400 text-center mt-2">
                            Connect to purchase tickets
                          </p>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading || isSoldOut}
                          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? '⏳ Processing...' : '✨ Buy Tickets'}
                        </button>
                      )}
                    </form>
                  )}

                  {/* Check-in Info */}
                  <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <p className="text-xs text-blue-300">
                      💡 Your NFT tickets will be instantly sent to your wallet on ApeChain after purchase. You can use them to check in at the event or trade them with others.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

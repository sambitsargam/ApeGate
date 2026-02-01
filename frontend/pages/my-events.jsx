import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function MyEvents() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && account) {
      loadUserEvents();
    }
  }, [account, mounted]);

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

  function loadUserEvents() {
    try {
      const allEvents = localStorage.getItem('apeGateEvents');
      if (allEvents) {
        const parsedEvents = JSON.parse(allEvents);
        const userEvents = parsedEvents.filter(
          event => event.creator.toLowerCase() === account.toLowerCase()
        );
        setEvents(userEvents);
      }
    } catch (e) {
      console.error('Error loading events:', e);
      setStatus('❌ Error loading your events');
    }
  }

  function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const allEvents = localStorage.getItem('apeGateEvents');
        if (allEvents) {
          const parsedEvents = JSON.parse(allEvents);
          const updatedEvents = parsedEvents.filter(event => event.id !== eventId);
          localStorage.setItem('apeGateEvents', JSON.stringify(updatedEvents));
          setEvents(updatedEvents.filter(
            event => event.creator.toLowerCase() === account.toLowerCase()
          ));
          setStatus('✅ Event deleted successfully');
        }
      } catch (e) {
        console.error('Error deleting event:', e);
        setStatus('❌ Error deleting event');
      }
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

  return (
    <>
      <Head>
        <title>My Events - ApeGate</title>
        <meta name="description" content="Manage your ApeGate events and tickets" />
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
              <Link href="/create-event">
                <button className="btn-primary text-sm">Create Event</button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-black mb-4 gradient-text">My Events</h1>
              <p className="text-xl text-gray-300">
                Manage your events and track ticket sales
              </p>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`mb-6 p-4 rounded-lg border ${
                status.includes('✅') ? 'bg-green-900/30 border-green-500/50 text-green-300' :
                'bg-red-900/30 border-red-500/50 text-red-300'
              }`}>
                {status}
              </div>
            )}

            {!account ? (
              // Not Connected State
              <div className="card text-center py-16">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-8">
                  Sign in to view and manage your events
                </p>
                <button 
                  type="button"
                  onClick={connectWallet}
                  className="btn-primary inline-block"
                >
                  Connect Wallet
                </button>
              </div>
            ) : events.length === 0 ? (
              // No Events State
              <div className="card text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold mb-4">No Events Yet</h2>
                <p className="text-gray-300 mb-8">
                  You haven't created any events. Start by creating your first event!
                </p>
                <Link href="/create-event">
                  <button className="btn-primary inline-block">
                    ✨ Create Your First Event
                  </button>
                </Link>
              </div>
            ) : (
              // Events Grid
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="card hover:border-cyan-400 transition-all">
                    {/* Event Image */}
                    {event.image && (
                      <div className="mb-4 -m-6 mb-4 rounded-t-xl overflow-hidden h-48">
                        <img 
                          src={event.image} 
                          alt={event.eventName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Event Title */}
                    <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">
                      {event.eventName}
                    </h3>

                    {/* Category Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full capitalize">
                        {event.category}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-6 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(event.eventDate).toLocaleDateString()} 
                          {event.eventTime ? ` at ${event.eventTime}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location || 'Virtual'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🎫</span>
                        <span>{event.ticketsSold}/{event.ticketsAvailable} tickets sold</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>{event.ticketPrice} ETH per ticket</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Tickets Sold</span>
                        <span className="text-cyan-400">
                          {Math.round((event.ticketsSold / event.ticketsAvailable) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all"
                          style={{ width: `${(event.ticketsSold / event.ticketsAvailable) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Event Stats */}
                    {event.ticketsSold > 0 && (
                      <div className="mb-6 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                        <div className="text-sm font-semibold text-cyan-300 mb-1">
                          Revenue
                        </div>
                        <div className="text-lg font-bold text-white">
                          {(event.ticketsSold * parseFloat(event.ticketPrice)).toFixed(4)} ETH
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/event/${event.id}`} className="flex-1">
                        <button className="w-full btn-secondary text-sm">
                          View Details
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id)}
                        className="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 transition-all text-sm border border-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Event Button */}
            {account && events.length > 0 && (
              <div className="mt-12 text-center">
                <Link href="/create-event">
                  <button className="btn-primary text-lg">
                    ✨ Create Another Event
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

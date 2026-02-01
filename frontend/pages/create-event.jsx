import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function CreateEvent() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    ticketPrice: '',
    maxTickets: '',
    category: 'conference',
    image: '',
  });

  useEffect(() => {
    setMounted(true);
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

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function createEvent(e) {
    e.preventDefault();
    
    if (!account) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    if (!formData.eventName || !formData.eventDate || !formData.ticketPrice || !formData.maxTickets) {
      setStatus('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    setStatus('⏳ Creating event...');

    try {
      // Store event data in localStorage (simulated backend)
      const eventId = Date.now();
      const eventData = {
        id: eventId,
        creator: account,
        ...formData,
        createdAt: new Date().toISOString(),
        ticketsAvailable: parseInt(formData.maxTickets),
        ticketsSold: 0,
      };

      // Get existing events
      const existingEvents = localStorage.getItem('apeGateEvents');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      // Add new event
      events.push(eventData);
      localStorage.setItem('apeGateEvents', JSON.stringify(events));

      setStatus(`✅ Event created successfully! Event ID: ${eventId}`);
      
      // Reset form
      setFormData({
        eventName: '',
        description: '',
        eventDate: '',
        eventTime: '',
        location: '',
        ticketPrice: '',
        maxTickets: '',
        category: 'conference',
        image: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/my-events';
      }, 2000);

    } catch (e) {
      console.error('Event creation error:', e);
      setStatus(`❌ Failed to create event: ${e.message}`);
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

  return (
    <>
      <Head>
        <title>Create Event - ApeGate</title>
        <meta name="description" content="Create your own event and sell tickets with NFTs" />
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
              <Link href="/my-events">
                <button className="btn-secondary text-sm">My Events</button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-4 gradient-text">Create Your Event</h1>
              <p className="text-xl text-gray-300">
                Set up your event and start selling NFT tickets instantly on ApeChain
              </p>
            </div>

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

            {/* Event Creation Form */}
            <form onSubmit={createEvent} className="space-y-6">
              <div className="card space-y-6">
                
                {/* Basic Info Section */}
                <div>
                  <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <span>📋</span> Event Details
                  </h2>

                  {/* Event Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Event Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleInputChange}
                      placeholder="e.g., Web3 Conference 2024"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      disabled={loading}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 h-24"
                      disabled={loading}
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      disabled={loading}
                    >
                      <option value="conference">Conference</option>
                      <option value="concert">Concert</option>
                      <option value="sports">Sports</option>
                      <option value="meetup">Meetup</option>
                      <option value="workshop">Workshop</option>
                      <option value="webinar">Webinar</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <span>📅</span> Date & Time
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        name="eventTime"
                        value={formData.eventTime}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., San Francisco, CA or Virtual"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Ticket Info Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <span>🎫</span> Ticket Info
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Ticket Price (ETH) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleInputChange}
                        placeholder="0.05"
                        step="0.001"
                        min="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Max Tickets <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxTickets"
                        value={formData.maxTickets}
                        onChange={handleInputChange}
                        placeholder="100"
                        min="1"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <span>🖼️</span> Event Image
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/event-image.jpg"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      disabled={loading}
                    />
                    {formData.image && (
                      <div className="mt-4">
                        <img 
                          src={formData.image} 
                          alt="Event preview" 
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !account}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  {loading ? '⏳ Creating...' : '✨ Create Event'}
                </button>
                <Link href="/" className="flex-1">
                  <button type="button" className="w-full btn-secondary text-center">
                    Cancel
                  </button>
                </Link>
              </div>

              {!account && (
                <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm text-center">
                  💡 Connect your wallet to create events
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

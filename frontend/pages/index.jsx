import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Landing() {
  return (
    <>
      <Head>
        <title>ApeGate - Event Ticketing with Instant Cross-Chain Delivery</title>
        <meta name="description" content="Pay for event tickets anywhere, receive NFTs instantly on ApeChain" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-black/30 backdrop-blur-md border-b border-cyan-500/20">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-black gradient-text">🐵 ApeGate</h1>
            <div className="space-x-4 flex items-center flex-wrap justify-end">
              <Link href="/create-event">
                <button className="btn-secondary text-sm md:text-base">Create Event</button>
              </Link>
              <Link href="/my-events">
                <button className="btn-secondary text-sm md:text-base">My Events</button>
              </Link>
              <Link href="/buy">
                <button className="btn-primary text-sm md:text-base">Get Tickets</button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              Event Ticketing <span className="gradient-text">Reimagined</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Pay for tickets on your preferred chain. Instantly receive NFTs on ApeChain. 
              Powered by Espresso finality and Presto cross-chain messaging.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/create-event">
                <button className="btn-primary text-lg">✨ Create Event</button>
              </Link>
              <Link href="/buy">
                <button className="btn-primary text-lg">Buy Tickets</button>
              </Link>
              <a href="#features" className="btn-secondary text-lg">Learn More</a>
            </div>
          </div>

          {/* Hero Animation */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-10 rounded-2xl animate-pulse"></div>
              <div className="relative text-center">
                <p className="text-sm text-gray-400 mb-4">🚀 Cross-Chain Flow</p>
                <div className="flex items-center justify-center gap-8 flex-wrap mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3 text-2xl">⛓️</div>
                    <p className="font-bold">Pay on Source</p>
                    <p className="text-sm text-gray-400">Your chain</p>
                  </div>
                  <div className="text-3xl animate-bounce">→</div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 text-2xl">🎫</div>
                    <p className="font-bold">Get NFT Ticket</p>
                    <p className="text-sm text-gray-400">ApeChain Gary</p>
                  </div>
                </div>
                <p className="text-sm text-cyan-400">Powered by Espresso + Hyperlane</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 border-t border-cyan-500/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16 gradient-text">Why ApeGate?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '⚡',
                  title: 'Instant Delivery',
                  desc: 'Receive your NFT ticket instantly after payment, not hours or days'
                },
                {
                  icon: '🔐',
                  title: 'Espresso Finality',
                  desc: 'Trust-minimized cross-chain settlement powered by Espresso consensus'
                },
                {
                  icon: '🌍',
                  title: 'Multi-Chain',
                  desc: 'Pay from any chain, receive on ApeChain. True cross-chain liquidity'
                },
                {
                  icon: '🎭',
                  title: 'NFT Tickets',
                  desc: 'Your ticket is an NFT. Trade, gift, or use for check-in'
                },
                {
                  icon: '🚀',
                  title: 'Powered by Presto',
                  desc: 'Built on Presto framework for secure cross-chain message delivery'
                },
                {
                  icon: '💰',
                  title: 'Minimal Fees',
                  desc: 'Lower costs than traditional ticketing with blockchain efficiency'
                }
              ].map((feature, i) => (
                <div key={i} className="card">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 border-t border-cyan-500/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16 gradient-text">How It Works</h2>
            <div className="space-y-8">
              {[
                {
                  num: '1',
                  title: 'Connect Your Wallet',
                  desc: 'Click "Get Tickets" and connect your Web3 wallet with the payment token'
                },
                {
                  num: '2',
                  title: 'Purchase Ticket',
                  desc: 'Approve the transaction and pay for your ticket in your preferred token'
                },
                {
                  num: '3',
                  title: 'Hyperlane Routes',
                  desc: 'Your payment message is securely routed via Hyperlane to ApeChain'
                },
                {
                  num: '4',
                  title: 'Espresso Validates',
                  desc: 'Espresso finality ensures your message is confirmed with cryptographic proof'
                },
                {
                  num: '5',
                  title: 'NFT Minted',
                  desc: 'Your unique NFT ticket is instantly minted on ApeChain and ready to use'
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                      <span className="text-white font-bold text-lg">{step.num}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-300">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 border-t border-cyan-500/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-6 gradient-text">Ready to Experience the Future?</h2>
            <p className="text-lg text-gray-300 mb-8">Join ApeGate and experience instant cross-chain ticketing powered by Espresso finality</p>
            <Link href="/buy">
              <button className="btn-primary text-xl px-12 py-4">Launch App</button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-cyan-500/20 text-center text-gray-500">
          <p>🐵 ApeGate • Espresso + Presto + Hyperlane • Built for the future</p>
        </footer>
      </div>
    </>
  );
}

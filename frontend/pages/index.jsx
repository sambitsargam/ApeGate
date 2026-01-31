import { useState } from 'react';
import { ethers } from 'ethers';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  const paymentAddress = process.env.NEXT_PUBLIC_PAYMENT_ADDRESS;
  const ticketPrice = process.env.NEXT_PUBLIC_TICKET_PRICE_WEI || '1000000000000000'; // 0.001 ETH default
  const apechainRpc = process.env.NEXT_PUBLIC_APECHAIN_RPC;
  const ticketNftAddress = process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS;

  async function connectWallet() {
    if (!window.ethereum) return alert('Install MetaMask');
    const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(acc);
  }

  async function buyTicket() {
    if (!account) return alert('Connect wallet');
    setStatus('Sending payment...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const paymentAbi = ["function buyTicket(uint256 eventId) payable"];
    const contract = new ethers.Contract(paymentAddress, paymentAbi, signer);

    const tx = await contract.buyTicket(1, { value: ticketPrice });
    setTxHash(tx.hash);
    setStatus('Waiting for transaction submission...');
    await tx.wait();
    setStatus('Payment submitted. Polling ApeChain for minted NFT...');

    // Poll for NFT ownership using ApeChain RPC
    const apeProvider = new ethers.providers.JsonRpcProvider(apechainRpc);
    const nftAbi = ["function balanceOf(address owner) view returns (uint256)", "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)", "function tokenURI(uint256 tokenId) view returns (string)"];
    const nft = new ethers.Contract(ticketNftAddress, nftAbi, apeProvider);

    const start = Date.now();
    while (Date.now() - start < 60_000) { // 60s timeout
      try {
        const bal = await nft.balanceOf(account);
        if (bal && bal.toNumber() > 0) {
          const tokenId = await nft.tokenOfOwnerByIndex(account, 0);
          const uri = await nft.tokenURI(tokenId);
          setTokenInfo({ tokenId: tokenId.toString(), uri });
          setStatus('Ticket minted! Access granted');
          return;
        }
      } catch (e) {
        // ignore: token may not exist yet
      }
      await new Promise(r => setTimeout(r, 3000));
    }

    setStatus('Timeout waiting for mint (increase polling time if needed)');
  }

  function qrUrl() {
    if (!tokenInfo || !account) return null;
    const payload = `token:${tokenInfo.tokenId};owner:${account}`;
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(payload)}`;
  }

  return (
    <div style={{padding:20}}>
      <h1>ApeGate — Pay anywhere. Enter instantly.</h1>
      <p>We rely on Espresso-confirmed state via Caff Nodes, enabling instant, trust-minimized UX.</p>
      <div>
        {account ? <div>Connected: {account}</div> : <button onClick={connectWallet}>Connect Wallet</button>}
      </div>
      <div style={{marginTop:20}}>
        <button onClick={buyTicket}>Buy Ticket (event #1)</button>
      </div>
      <div style={{marginTop:20}}>
        <div>Status: {status}</div>
        {txHash && <div>Payment tx: {txHash}</div>}
        {tokenInfo && (
          <div>
            <div>Token ID: {tokenInfo.tokenId}</div>
            <div>TokenURI: <a href={tokenInfo.uri} target="_blank" rel="noreferrer">view</a></div>
            <div><img src={qrUrl()} alt="qr"/></div>
          </div>
        )}
      </div>
    </div>
  );
}

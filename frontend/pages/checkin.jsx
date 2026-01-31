import { useState } from 'react';
import { ethers } from 'ethers';

export default function Checkin() {
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const apechainRpc = process.env.NEXT_PUBLIC_APECHAIN_RPC;
  const nftAddress = process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS;

  async function verify() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(apechainRpc);
      const nftAbi = ["function balanceOf(address owner) view returns (uint256)"];
      const nft = new ethers.Contract(nftAddress, nftAbi, provider);
      const bal = await nft.balanceOf(address);
      if (bal && bal.toNumber() > 0) {
        setMessage('Access Granted ✅');
      } else {
        setMessage('No ticket found ✖️');
      }
    } catch (e) {
      setMessage('Error verifying ownership');
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>IRL Check-in</h2>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="wallet address" style={{width:400}}/>
      <div><button onClick={verify}>Verify Ownership</button></div>
      <div>{message}</div>
    </div>
  );
}

import '../../assets/styles/App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import nftContractAbi from '../../abis/contractABI.json'; // ABI of your NFT contract

const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS_NFT;

const Register = ({ onMint }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } catch (error) {
          console.error('MetaMask connection error', error);
        }
      } else {
        console.error('MetaMask not detected');
      }
    };

    connectMetaMask();
  }, []);

  const handleRegister = async () => {
    if (!account) {
      console.error('MetaMask not connected');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftContractAbi, signer);

    const metadata = {
      name,
      role,
      organization,
      email,
    };

    // Store metadata on IPFS
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    });

    const data = await response.json();
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;

    // Mint the NFT with the tokenURI and user information
    await contract.mintNFT(
      account,
      tokenURI,
      name,
      role,
      organization,
      email
    );

    onMint();
  };

  return (
    <div>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
      <input type="text" placeholder="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleRegister}>Register and Mint NFT</button>
    </div>
  );
};

export default Register;

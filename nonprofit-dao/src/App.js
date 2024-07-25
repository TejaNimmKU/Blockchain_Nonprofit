// src/App.js
import React, { useState } from 'react';
import { ethers } from 'ethers';
import nftContractAbi from './abis/contractABI'; // ABI of your NFT contract
//import './assets/styles/App.css';
import PageContent from './components/Auth/PageContent'; // Import the new component

const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS_NFT;

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleLogin = async (account) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftContractAbi.abi, provider);
    try {
      const totalSupply = await contract.totalSupply();
      let tokenId = null;

      for (let i = 1; i <= totalSupply; i++) {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === account.toLowerCase()) {
          tokenId = i;
          break;
        }
      }

      if (tokenId !== null) {
        const tokenUri = await contract.tokenURI(tokenId);
        const response = await fetch(tokenUri);
        const metadata = await response.json();

        setUser({
          name: metadata.name,
          role: metadata.role,
          organization: metadata.organization,
          email: metadata.email,
        });
        setRole(metadata.role);
      } else {
        console.error('No NFTs found for this account.');
      }
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
    }
  };

  const handleMint = () => {
    setIsMinting(false);
    const account = window.ethereum.selectedAddress;
    handleLogin(account);
  };

  return (
    <div className="App">
      <PageContent 
        user={user} 
        role={role} 
        isMinting={isMinting} 
        handleMint={handleMint} 
        handleLogin={handleLogin} 
        setIsMinting={setIsMinting} 
      />
    </div>
  );
};

export default App;

import styles from "../assets/styles/MetaMaskLogin.module.css";
// src/components/MetaMaskLogin.js

import React from 'react';
import { ethers } from 'ethers';

const MetaMaskLogin = ({ onLogin }) => {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        onLogin(account);
      } catch (error) {
        console.error('User rejected the request', error);
      }
    } else {
      console.error('Metamask not found');
    }
  };

  return (
    <button onClick={connectWallet}>Login with MetaMask</button>
  );
};

export default MetaMaskLogin;

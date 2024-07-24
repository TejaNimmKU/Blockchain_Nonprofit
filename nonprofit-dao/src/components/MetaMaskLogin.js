import React from 'react';
import Web3 from 'web3';
import './../assets/styles/App.css'
const MetaMaskLogin = ({ onLogin }) => {
  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log('Connected account:', account);
        onLogin(account);
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Login with MetaMask</button>
    </div>
  );
};

export default MetaMaskLogin;

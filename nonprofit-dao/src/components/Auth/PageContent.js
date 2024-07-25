// src/components/PageContent.js
import React from 'react';
import MetaMaskLogin from './../MetaMaskLogin';
import DAODashboard from './../Dashboards/DaoAdminDashboard';
import NonprofitDashboard from './../Dashboards/NonprofitDashboard';
import Register from './Register';
import './../../assets/styles/PageContent.css'

const PageContent = ({ user, role, isMinting, handleMint, handleLogin, setIsMinting }) => {
  return (
    <>
      <header>
        <h2>Decentralized Dreamers DAO</h2>
        <h1>Make it Possible.</h1>
      </header>
      {!user ? (
        <>
          {isMinting ? (
            <Register onMint={handleMint} />
          ) : (
            <MetaMaskLogin onLogin={handleLogin} />
          )}
          <button onClick={() => setIsMinting(true)}>Register and Mint NFT</button>
        </>
      ) : role === 'dao' ? (
        <DAODashboard user={user} />
      ) : (
        <NonprofitDashboard user={user} />
      )}
    </>
  );
};

export default PageContent;

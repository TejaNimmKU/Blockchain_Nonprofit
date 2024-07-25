import React from 'react';
import './../assets/styles/App.css'

function HomePage({ setCurrentPage }) {
    return (
        <div className='HomePage'>
            <h1>Welcome to Decentralized Dreamers!</h1>
            <button onClick={() => setCurrentPage('login')}>Login with MetaMask</button>
            <button onClick={() => setCurrentPage('register')}>Register</button>
        </div>
    );
}

export default HomePage;
import React, { useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAmoy } from "./AmoyContext"; // Import useAmoy hook
import { signMessage } from "./SignMessage"; // Import the signMessage function
import nftContractAbi from "../../abis/contractABI.json"; // ABI of your NFT contract

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT;

function Login({ setRole }) {
  const {
    walletConnected,
    currentChainId,
    connectWallet,
    addPolygonAmoyNetwork,
  } = useAmoy(); // Ensure correct usage of useAmoy hook

  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [showRegisterMessage, setShowRegisterMessage] = useState(false); // State for registration message
  const navigate = useNavigate();

  const onConnect = async () => {
    try {
      if (!walletConnected) {
        await connectWallet();
      }

      // if (currentChainId !== "0x13882") {
      //     await addPolygonAmoyNetwork();
      //     setError("Please switch MetaMask network to Polygon Amoy Testnet.");
      //     return;
      // }

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setWalletAddress(accounts[0]);
      console.log("Connected wallet address:", accounts[0]);

      const messageResponse = await axios.post("http://localhost:3002/auth/request-message", {
        address: accounts[0],
        chain: "0x1",
        networkType: "evm",
      });
      console.log("Message for signature:", messageResponse.data.message);

      const message = messageResponse.data.message;
      const signature = await signMessage(message, accounts[0]); // Use signMessage function here

      const verifyResponse = await axios.post("http://localhost:3002/auth/sign-message", {
        networkType: "evm", // Adjust networkType as per your backend's requirements
        message,
        signature,
      });
      console.log("Verification response:", verifyResponse.data);

      if (verifyResponse.data.needsRegistration) {
        setShowRegisterMessage(true); // Show registration message
        setTimeout(() => {
          navigate("/register", { state: { authData: verifyResponse.data.authData } });
        }, 3000); // Wait for 3 seconds before navigating
      } else {
        setRole(verifyResponse.data.user.role);
        localStorage.setItem("token", verifyResponse.data.token);

        // Fetch NFT information
        const contract = new web3.eth.Contract(nftContractAbi.abi, NFT_CONTRACT_ADDRESS);
        const tokenId = 1; // Replace with the logic to get the correct tokenId
        const tokenName = await contract.methods.getTokenName(tokenId).call();
        const tokenRole = await contract.methods.getTokenRole(tokenId).call();
        const tokenOrganization = await contract.methods.getTokenOrganization(tokenId).call();
        const tokenEmail = await contract.methods.getTokenEmail(tokenId).call();

        console.log("NFT Information:");
        console.log("Name:", tokenName);
        console.log("Role:", tokenRole);
        console.log("Organization:", tokenOrganization);
        console.log("Email:", tokenEmail);

        navigate(`/${verifyResponse.data.user.role}Dashboard`);
      }
    } catch (err) {
      setError("An error occurred during the login process.");
      console.error(err);
    }
  };

  return (
    <div className="Login">
      <h1>Login</h1>
      <button onClick={onConnect}>Login with MetaMask</button>
      {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {showRegisterMessage && <p>You need to register first. Redirecting to the registration page...</p>}
    </div>
  );
}

export default Login;

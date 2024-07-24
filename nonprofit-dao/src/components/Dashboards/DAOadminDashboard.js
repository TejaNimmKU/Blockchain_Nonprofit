import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './../../assets/styles/DAODashboard.css';

const pinataJWT = process.env.REACT_APP_PINATA_JWT;

function DAODashboard({ user }) {
    const [requestsData, setRequestsData] = useState({
        Sent: [],
        InProgress: [],
        Approved: [],
        Denied: []
    });

    const fetchRequestFromIPFS = async (cid) => {
        try {
            const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
            return { ...res.data, cid };
        } catch (error) {
            console.error('Error fetching request from IPFS:', error);
            return null;
        }
    };

    const loadRequests = useCallback(async () => {
        const localData = JSON.parse(localStorage.getItem('requestsData')) || {
            Sent: [],
            InProgress: [],
            Approved: [],
            Denied: []
        };

        const fetchAllRequests = async () => {
            const fetchRequests = async (state) => {
                const cids = localData[state].map(request => request.CID);
                const requests = await Promise.all(cids.map(cid => fetchRequestFromIPFS(cid)));
                return requests.filter(request => request !== null);
            };

            const sentRequests = await fetchRequests('Sent');
            const inProgressRequests = await fetchRequests('In-Progress');
            const approvedRequests = await fetchRequests('Approved');
            const deniedRequests = await fetchRequests('Denied');

            setRequestsData({
                Sent: sentRequests,
                InProgress: inProgressRequests,
                Approved: approvedRequests,
                Denied: deniedRequests
            });
        };

        fetchAllRequests();
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const updateRequestState = async (cid, newState) => {
        try {
            const request = requestsData.Sent.find(req => req.cid === cid) || 
                            requestsData.InProgress.find(req => req.cid === cid) || 
                            requestsData.Approved.find(req => req.cid === cid) || 
                            requestsData.Denied.find(req => req.cid === cid);

            if (!request) return;

            const updatedRequest = { ...request, state: newState };
            const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', updatedRequest, {
                headers: {
                    Authorization: `Bearer ${pinataJWT}`
                }
            });

            const updatedCIDs = JSON.parse(localStorage.getItem('requestCIDs')) || [];
            const newRequestCID = res.data.IpfsHash;
            const index = updatedCIDs.indexOf(cid);
            if (index !== -1) {
                updatedCIDs[index] = newRequestCID;
            }
            localStorage.setItem('requestCIDs', JSON.stringify(updatedCIDs));

            loadRequests();
        } catch (error) {
            console.error('Error updating request state:', error);
        }
    };

    const handleApprove = (cid) => {
        console.log(`Request ${cid} approved.`);
        updateRequestState(cid, 'Approved');
    };

    const handleDeny = (cid) => {
        console.log(`Request ${cid} denied.`);
        updateRequestState(cid, 'Denied');
    };

    const getRequestsByState = (state) => {
        return requestsData[state] || [];
    };

    return (
        <div className='DAODashboard'>
            <h1>DAO Dashboard</h1>
            <p>Welcome, {user.name}! This is your dashboard.</p>
            <div className="task-board">
                <div className="column">
                    <h2>Sent</h2>
                    {getRequestsByState('Sent').map(request => (
                        <div key={request.cid} className="task">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                            <p>Invoice CID: {request.invoiceCID}</p>
                            <button onClick={() => handleApprove(request.cid)}>Approve</button>
                            <button onClick={() => handleDeny(request.cid)}>Deny</button>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Needs Further Approval</h2>
                    {getRequestsByState('InProgress').map(request => (
                        <div key={request.cid} className="task">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                            <p>Invoice CID: {request.invoiceCID}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Approved</h2>
                    {getRequestsByState('Approved').map(request => (
                        <div key={request.cid} className="task">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                            <p>Invoice CID: {request.invoiceCID}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Denied</h2>
                    {getRequestsByState('Denied').map(request => (
                        <div key={request.cid} className="task">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                            <p>Invoice CID: {request.invoiceCID}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DAODashboard;

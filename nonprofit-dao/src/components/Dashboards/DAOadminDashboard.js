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

        const fetchAllRequests = async (state) => {
            if (Array.isArray(localData[state])) {
                const cids = localData[state].map(request => request.CID);
                const requests = await Promise.all(cids.map(cid => fetchRequestFromIPFS(cid)));
                return requests.filter(request => request !== null);
            }
            return [];
        };

        const sentRequests = await fetchAllRequests('Sent');
        const inProgressRequests = await fetchAllRequests('InProgress');
        const approvedRequests = await fetchAllRequests('Approved');
        const deniedRequests = await fetchAllRequests('Denied');

        setRequestsData({
            Sent: sentRequests,
            InProgress: inProgressRequests,
            Approved: approvedRequests,
            Denied: deniedRequests
        });
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const updateRequestInLocalStorage = (cid, action) => {
        const requestsData = JSON.parse(localStorage.getItem('requestsData')) || {
            Sent: [],
            InProgress: [],
            Approved: [],
            Denied: []
        };
    
        const updateList = (state) => {
            if (Array.isArray(requestsData[state])) {
                return requestsData[state].map(req => {
                    if (req.CID === cid) {
                        return {
                            ...req,
                            ["Approved By"]: action === 'approve' ? [...req["Approved By"], user.name] : req["Approved By"],
                            ["Denied By"]: action === 'deny' ? [...req["Denied By"], user.name] : req["Denied By"]
                        };
                    }
                    return req;
                });
            }
            return [];
        };
    
        const newRequestsData = {
            Sent: updateList('Sent').filter(req => req.CID !== cid),
            InProgress: [...requestsData.InProgress, ...updateList('Sent').filter(req => req.CID === cid)],
            Approved: action === 'approve' ? [...requestsData.Approved, ...requestsData.InProgress.filter(req => req.CID === cid)] : requestsData.Approved,
            Denied: action === 'deny' ? [...requestsData.Denied, ...requestsData.InProgress.filter(req => req.CID === cid)] : requestsData.Denied
        };
    
        localStorage.setItem('requestsData', JSON.stringify(newRequestsData));
    
        loadRequests();
    };
    

    const handleApprove = (cid) => {
        console.log(`Request ${cid} approved.`);
        updateRequestInLocalStorage(cid, 'approve');
    };

    const handleDeny = (cid) => {
        console.log(`Request ${cid} denied.`);
        updateRequestInLocalStorage(cid, 'deny');
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
                    <h2>Awaiting Review</h2>
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

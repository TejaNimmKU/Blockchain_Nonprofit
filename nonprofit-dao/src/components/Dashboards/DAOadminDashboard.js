import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './../../assets/styles/DAODashboard.css';
import { getRequestsData, setRequestsData } from './localStorage';

const pinataJWT = process.env.REACT_APP_PINATA_JWT;

function DAODashboard({ user }) {
    const [requestsData, setRequestsDataState] = useState({
        Sent: [],
        InProgress: [],
        Approved: [],
        Denied: []
    });

    const [ipfsData, setIpfsData] = useState({});

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
        const localData = getRequestsData();
        const allRequests = ['Sent', 'InProgress', 'Approved', 'Denied'];

        let ipfsRequests = {};
        for (let state of allRequests) {
            const requests = localData[state] || [];
            for (let request of requests) {
                if (request.CID) {
                    const ipfsRequest = await fetchRequestFromIPFS(request.CID);
                    if (ipfsRequest) {
                        ipfsRequests[request.CID] = ipfsRequest;
                    }
                }
            }
        }

        setIpfsData(ipfsRequests);
        setRequestsDataState(localData);
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const updateRequestInLocalStorage = (cid, action) => {
        const localData = getRequestsData();

        const updateList = (state) => {
            return localData[state].map(req => {
                if (req.CID === cid) {
                    return {
                        ...req,
                        ["Approved By"]: action === 'approve' ? [...req["Approved By"], user.name] : req["Approved By"],
                        ["Denied By"]: action === 'deny' ? [...req["Denied By"], user.name] : req["Denied By"]
                    };
                }
                return req;
            });
        };

        const newRequestsData = {
            Sent: updateList('Sent').filter(req => req.CID !== cid),
            InProgress: [...localData.InProgress, ...updateList('Sent').filter(req => req.CID === cid)],
            Approved: action === 'approve' ? [...localData.Approved, ...localData.InProgress.filter(req => req.CID === cid)] : localData.Approved,
            Denied: action === 'deny' ? [...localData.Denied, ...localData.InProgress.filter(req => req.CID === cid)] : localData.Denied
        };

        setRequestsData(newRequestsData);
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
        const localRequests = requestsData[state] || [];

        if (state === 'Awaiting Review') {
            const sentRequests = requestsData.Sent || [];
            const inProgressRequests = (requestsData.InProgress || []).filter(request => {
                const approvedBy = request["Approved By"] || [];
                const deniedBy = request["Denied By"] || [];
                return !approvedBy.includes(user.name) && !deniedBy.includes(user.name);
            });
            return [...sentRequests, ...inProgressRequests];
        }

        if (state === 'Needs Further Approval') {
            return (requestsData.InProgress || []).filter(request => {
                const approvedBy = request["Approved By"] || [];
                const deniedBy = request["Denied By"] || [];
                return approvedBy.includes(user.name) || deniedBy.includes(user.name);
            });
        }

        return localRequests;
    };

    const combineRequestData = (request) => {
        const cid = request.CID;
        const ipfsRequest = ipfsData[cid] || {};
        return { ...ipfsRequest, ...request };
    };

    return (
        <div className='DAODashboard'>
            <h1>DAO Dashboard</h1>
            <p>Welcome, {user.name}! This is your dashboard.</p>
            <div className="task-board">
                <div className="column">
                    <h2>Awaiting Review</h2>
                    {getRequestsByState('Awaiting Review').map(request => {
                        const combinedRequest = combineRequestData(request);
                        return (
                            <div key={combinedRequest.cid} className="task">
                                <h3>Amount: {combinedRequest.amount}</h3>
                                <p>Vendor: {combinedRequest.vendor}</p>
                                <p>Uses: {combinedRequest.uses}</p>
                                <p>Vendor Wallet: {combinedRequest.vendorWallet}</p>
                                <p>Invoice CID: {combinedRequest.invoiceCID}</p>
                                <button onClick={() => handleApprove(combinedRequest.cid)}>Approve</button>
                                <button onClick={() => handleDeny(combinedRequest.cid)}>Deny</button>
                            </div>
                        );
                    })}
                </div>
                <div className="column">
                    <h2>Needs Further Approval</h2>
                    {getRequestsByState('Needs Further Approval').map(request => {
                        const combinedRequest = combineRequestData(request);
                        return (
                            <div key={combinedRequest.cid} className="task">
                                <h3>Amount: {combinedRequest.amount}</h3>
                                <p>Vendor: {combinedRequest.vendor}</p>
                                <p>Uses: {combinedRequest.uses}</p>
                                <p>Vendor Wallet: {combinedRequest.vendorWallet}</p>
                                <p>Invoice CID: {combinedRequest.invoiceCID}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="column">
                    <h2>Approved</h2>
                    {getRequestsByState('Approved').map(request => {
                        const combinedRequest = combineRequestData(request);
                        return (
                            <div key={combinedRequest.cid} className="task">
                                <h3>Amount: {combinedRequest.amount}</h3>
                                <p>Vendor: {combinedRequest.vendor}</p>
                                <p>Uses: {combinedRequest.uses}</p>
                                <p>Vendor Wallet: {combinedRequest.vendorWallet}</p>
                                <p>Invoice CID: {combinedRequest.invoiceCID}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="column">
                    <h2>Denied</h2>
                    {getRequestsByState('Denied').map(request => {
                        const combinedRequest = combineRequestData(request);
                        return (
                            <div key={combinedRequest.cid} className="task">
                                <h3>Amount: {combinedRequest.amount}</h3>
                                <p>Vendor: {combinedRequest.vendor}</p>
                                <p>Uses: {combinedRequest.uses}</p>
                                <p>Vendor Wallet: {combinedRequest.vendorWallet}</p>
                                <p>Invoice CID: {combinedRequest.invoiceCID}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DAODashboard;

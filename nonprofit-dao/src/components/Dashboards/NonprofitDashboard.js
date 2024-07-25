import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './../../assets/styles/NonprofitDashboard.css';
import { getRequestsData, setRequestsData } from './localStorage';

const pinataJWT = process.env.REACT_APP_PINATA_JWT;

function NonprofitDashboard({ user }) {
    const [showPopup, setShowPopup] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        vendor: '',
        uses: '',
        vendorWallet: '',
        invoice: null,
    });
    const [requests, setRequests] = useState({
        Sent: [],
        InProgress: [],
        Approved: [],
        Denied: []
    });

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        const requestsData = getRequestsData();
        const updatedRequests = { ...requestsData };

        const fetchRequestData = async (cid) => {
            try {
                const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching request data from IPFS:', error);
                return null;
            }
        };

        const fetchAllRequests = async () => {
            const sentRequests = await Promise.all(
                updatedRequests.Sent.map(async (request) => ({
                    ...await fetchRequestData(request.CID),
                    CID: request.CID
                }))
            );

            const inProgressRequests = await Promise.all(
                updatedRequests.InProgress.map(async (request) => ({
                    ...await fetchRequestData(request.CID),
                    CID: request.CID
                }))
            );

            const approvedRequests = await Promise.all(
                updatedRequests.Approved.map(async (request) => ({
                    ...await fetchRequestData(request.CID),
                    CID: request.CID
                }))
            );

            const deniedRequests = await Promise.all(
                updatedRequests.Denied.map(async (request) => ({
                    ...await fetchRequestData(request.CID),
                    CID: request.CID
                }))
            );

            setRequests({
                Sent: sentRequests,
                InProgress: inProgressRequests,
                Approved: approvedRequests,
                Denied: deniedRequests
            });
        };

        fetchAllRequests();
    };

    const uploadToIPFS = async (file) => {
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
                maxContentLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    Authorization: `Bearer ${pinataJWT}`
                }
            });
            return res.data.IpfsHash;
        } catch (error) {
            console.error('Error uploading file to IPFS:', error);
            return null;
        }
    };

    const saveRequestToIPFS = async (request) => {
        try {
            const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', request, {
                headers: {
                    Authorization: `Bearer ${pinataJWT}`
                }
            });
            return res.data.IpfsHash;
        } catch (error) {
            console.error('Error saving request to IPFS:', error);
            return null;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, invoice: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const invoiceCID = await uploadToIPFS(formData.invoice);
        if (!invoiceCID) {
            alert('Failed to upload invoice to IPFS');
            return;
        }

        const newRequest = {
            organization: user.organization,
            amount: formData.amount,
            vendor: formData.vendor,
            uses: formData.uses,
            vendorWallet: formData.vendorWallet,
            invoiceCID: invoiceCID,
            state: 'Sent'
        };

        const requestCID = await saveRequestToIPFS(newRequest);
        if (!requestCID) {
            alert('Failed to save request to IPFS');
            return;
        }

        const requestsData = getRequestsData();
        requestsData.Sent.push({ CID: requestCID, "Approved By": [], "Denied By": [] });
        setRequestsData(requestsData);

        setShowPopup(false);
        setFormData({
            amount: '',
            vendor: '',
            uses: '',
            vendorWallet: '',
            invoice: null,
        });

        loadRequests(); // Refresh requests list
    };

    const getRequestsByState = (state) => {
        console.log(`Fetching requests for state: ${state}`);
        console.log(requests[state]); // Debugging line
        return Array.isArray(requests[state]) ? requests[state] : [];
    };

    return (
        <div className='NonprofitDashboard'>
            <h1>Medical Miracle Makers Dashboard</h1>
            <p>Welcome, {user.name}!</p>
            <button onClick={() => setShowPopup(true)}>Make a Request</button>

            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Create Request for {user.organization}:</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Amount:
                                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Vendor:
                                <input type="text" name="vendor" value={formData.vendor} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Uses:
                                <input type="text" name="uses" value={formData.uses} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Vendor's Wallet Address:
                                <input type="text" name="vendorWallet" value={formData.vendorWallet} onChange={handleInputChange} required />
                            </label>
                            <label>
                                Attach Invoice:
                                <input type="file" onChange={handleFileChange} required />
                            </label>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="task-board">
                <div className="column">
                    <h2>Sent</h2>
                    {getRequestsByState('Sent').map(request => (
                        <div key={request.CID} className="task">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                            <p>Invoice CID: {request.invoiceCID}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>In Progress</h2>
                    {getRequestsByState('InProgress').map(request => (
                        <div key={request.CID} className="task">
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
                        <div key={request.CID} className="task">
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
                        <div key={request.CID} className="task">
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

export default NonprofitDashboard;

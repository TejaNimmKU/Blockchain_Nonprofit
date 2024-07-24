import React, { useState } from 'react';
import './../../assets/styles/NonprofitDashboard.css';

function NonprofitDashboard({ user }) {
    // Example requests for demonstration purposes
    const sentRequests = [
        { id: 1, amount: '1000', vendor: 'Vendor A', uses: 'Supplies', vendorWallet: '0x123' },
        { id: 2, amount: '2000', vendor: 'Vendor B', uses: 'Equipment', vendorWallet: '0x456' },
    ];

    const inProgressRequests = [
        { id: 3, amount: '1500', vendor: 'Vendor C', uses: 'Training', vendorWallet: '0x789' },
    ];

    const approvedRequests = [
        { id: 4, amount: '3000', vendor: 'Vendor D', uses: 'Software', vendorWallet: '0xabc' },
    ];

    const [showPopup, setShowPopup] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        vendor: '',
        uses: '',
        vendorWallet: '',
        invoice: null,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, invoice: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        // Submit the request here
        setShowPopup(false);
    };

    return (
        <div className='NonprofitDashboard'>
            <h1>Nonprofit Dashboard</h1>
            <p>Welcome, {user.name} from {user.organization}! This is your dashboard.</p>
            <button className="request-button" onClick={() => setShowPopup(true)}>Make a Request</button>
            <div className="request-board">
                <div className="column">
                    <h2>Sent</h2>
                    {sentRequests.map(request => (
                        <div key={request.id} className="request">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>In Progress</h2>
                    {inProgressRequests.map(request => (
                        <div key={request.id} className="request">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Approved</h2>
                    {approvedRequests.map(request => (
                        <div key={request.id} className="request">
                            <h3>Amount: {request.amount}</h3>
                            <p>Vendor: {request.vendor}</p>
                            <p>Uses: {request.uses}</p>
                            <p>Vendor Wallet: {request.vendorWallet}</p>
                        </div>
                    ))}
                </div>
            </div>
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Create Request for {user.organization}:</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Amount:
                                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} />
                            </label>
                            <label>
                                Vendor:
                                <input type="text" name="vendor" value={formData.vendor} onChange={handleInputChange} />
                            </label>
                            <label>
                                Uses:
                                <input type="text" name="uses" value={formData.uses} onChange={handleInputChange} />
                            </label>
                            <label>
                                Vendor's Wallet Address:
                                <input type="text" name="vendorWallet" value={formData.vendorWallet} onChange={handleInputChange} />
                            </label>
                            <label>
                                Attach Invoice:
                                <input type="file" name="invoice" onChange={handleFileChange} />
                            </label>
                            <button type="submit">Submit</button>
                            <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NonprofitDashboard;

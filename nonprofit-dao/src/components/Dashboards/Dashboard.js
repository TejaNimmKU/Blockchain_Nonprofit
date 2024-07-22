import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NonprofitDashboard from './NonprofitDashboard';
import DAOadminDashboard from './DaoAdminDashboard';

function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (!token) {
        navigate('/login');
        return null;
    }

    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    switch (userRole) {
        case 'Nonprofit':
            return <NonprofitDashboard />;
        case 'DAOadmin':
            return <DAOadminDashboard />;
        default:
            return <div>Invalid user role</div>;
    }
}

export default Dashboard;
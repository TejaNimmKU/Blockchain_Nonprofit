// src/utils/localStorage.js

export const getRequestsData = () => {
    const data = localStorage.getItem('requestsData');
    return data ? JSON.parse(data) : {
        "Sent": [],
        "InProgress": [],
        "Approved": [],
        "Denied": []
    };
};

export const setRequestsData = (data) => {
    localStorage.setItem('requestsData', JSON.stringify(data));
};

import React from 'react';
import './../../assets/styles/DAODashboard.css';

function DAODashboard({ user }) {
    // Example tasks for demonstration purposes
    const impendingTasks = [
        { id: 1, title: 'Task 1', description: 'Description for Task 1' },
        { id: 2, title: 'Task 2', description: 'Description for Task 2' },
    ];

    const inProgressTasks = [
        { id: 3, title: 'Task 3', description: 'Description for Task 3' },
    ];

    const completedTasks = [
        { id: 4, title: 'Task 4', description: 'Description for Task 4' },
    ];

    const handleApprove = (taskId) => {
        console.log(`Task ${taskId} approved.`);
    };

    const handleDeny = (taskId) => {
        console.log(`Task ${taskId} denied.`);
    };

    return (
        <div className='DAODashboard'>
            <h1>DAO Dashboard</h1>
            <p>Welcome, {user.name}! This is your dashboard.</p>
            <div className="task-board">
                <div className="column">
                    <h2>Awaiting Review</h2>
                    {impendingTasks.map(task => (
                        <div key={task.id} className="task">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <button onClick={() => handleApprove(task.id)}>Approve</button>
                            <button onClick={() => handleDeny(task.id)}>Deny</button>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Needs Further Approval</h2>
                    {inProgressTasks.map(task => (
                        <div key={task.id} className="task">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Approved</h2>
                    {completedTasks.map(task => (
                        <div key={task.id} className="task">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                        </div>
                    ))}
                </div>
                <div className="column">
                    <h2>Denied</h2>
                    {completedTasks.map(task => (
                        <div key={task.id} className="task">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DAODashboard;

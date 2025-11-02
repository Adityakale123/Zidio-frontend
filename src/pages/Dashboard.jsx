import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/StudentDashboard';
import RecruiterDashboard from '../components/RecruiterDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    if (user.role === 'STUDENT') return <StudentDashboard />;
    if (user.role === 'RECRUITER') return <RecruiterDashboard />;
    if (user.role === 'ADMIN') return <AdminDashboard />;

    return <div>Invalid role</div>;
};

export default Dashboard;
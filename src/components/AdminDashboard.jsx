import React, { useState, useEffect } from 'react';
import { admin } from '../utils/api';
import { Users, Briefcase, FileText, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, analyticsRes] = await Promise.all([
                admin.getAllUsers(),
                admin.getAnalytics()
            ]);

            setUsers(usersRes.data.data);
            setAnalytics(analyticsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            await admin.approveUser(userId);
            alert('User approved successfully!');
            fetchData();
        } catch (error) {
            alert('Failed to approve user');
        }
    };

    const handleBlockUser = async (userId) => {
        if (window.confirm('Are you sure you want to block this user?')) {
            try {
                await admin.blockUser(userId);
                alert('User blocked successfully!');
                fetchData();
            } catch (error) {
                alert('Failed to block user');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await admin.deleteUser(userId);
                alert('User deleted successfully!');
                fetchData();
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 mb-1">Total Users</p>
                                    <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                                </div>
                                <Users className="text-blue-600" size={48} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 mb-1">Total Students</p>
                                    <p className="text-3xl font-bold">{analytics.totalStudents}</p>
                                </div>
                                <Users className="text-green-600" size={48} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 mb-1">Total Recruiters</p>
                                    <p className="text-3xl font-bold">{analytics.totalRecruiters}</p>
                                </div>
                                <Briefcase className="text-purple-600" size={48} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 mb-1">Total Jobs</p>
                                    <p className="text-3xl font-bold">{analytics.totalJobs}</p>
                                </div>
                                <FileText className="text-orange-600" size={48} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 mb-1">Active Jobs</p>
                                    <p className="text-3xl font-bold">{analytics.activeJobs}</p>
                                </div>
                                <TrendingUp className="text-red-600" size={48} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 mb-1">Total Applications</p>
                                    <p className="text-3xl font-bold">{analytics.totalApplications}</p>
                                </div>
                                <FileText className="text-cyan-600" size={48} />
                            </div>
                        </div>
                    </div>
                )}

                {/* User Management */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b">
                        <div className="flex">
                            <button
                                className={`px-6 py-3 ${activeTab === 'users' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                                onClick={() => setActiveTab('users')}
                            >
                                All Users ({users.length})
                            </button>
                            <button
                                className={`px-6 py-3 ${activeTab === 'pending' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending Approvals ({users.filter(u => u.status === 'PENDING').length})
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6">User Management</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Name</th>
                                        <th className="text-left py-3 px-4">Email</th>
                                        <th className="text-left py-3 px-4">Role</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users
                                        .filter(user => activeTab === 'pending' ? user.status === 'PENDING' : true)
                                        .map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">{user.fullName}</td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${user.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                                                            user.role === 'RECRUITER' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        {user.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleApproveUser(user.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                        )}
                                                        {user.status !== 'BLOCKED' && (
                                                            <button
                                                                onClick={() => handleBlockUser(user.id)}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                                title="Block"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <XCircle size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { student } from '../utils/api';
import { Briefcase, Bookmark, ArrowLeft } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [activeTab, setActiveTab] = useState('applications'); // Changed default tab
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [jobDetails, setJobDetails] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [applicationsRes, bookmarksRes] = await Promise.all([
                student.getApplications(user.userId),
                student.getBookmarks(user.userId)
            ]);

            setApplications(applicationsRes.data.data);
            setBookmarks(bookmarksRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobDetails = async (jobId) => {
        try {
            const response = await student.getJobDetails(jobId);
            setJobDetails(response.data.data);
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
    };

    const handleApplicationClick = (app) => {
        setSelectedApplication(app);
        fetchJobDetails(app.jobId);
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-6 py-3 ${activeTab === 'applications' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            <Briefcase className="inline mr-2" size={20} />
                            Applications ({applications.length})
                        </button>
                        <button
                            className={`px-6 py-3 ${activeTab === 'bookmarks' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                            onClick={() => setActiveTab('bookmarks')}
                        >
                            <Bookmark className="inline mr-2" size={20} />
                            Bookmarks ({bookmarks.length})
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'applications' && (
                            <div>
                                {selectedApplication ? (
                                    <div>
                                        <button
                                            onClick={() => setSelectedApplication(null)}
                                            className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
                                        >
                                            <ArrowLeft className="mr-2" size={20} />
                                            Back to Applications
                                        </button>

                                        <div className="space-y-6">
                                            <div className="border-b pb-4">
                                                <h2 className="text-2xl font-bold mb-2">{jobDetails?.title || 'Job Details'}</h2>
                                                <div className="flex gap-4 text-sm text-gray-600">
                                                    <span>📍 {jobDetails?.location}</span>
                                                    <span>💰 ₹{jobDetails?.salary}</span>
                                                    <span>📅 {jobDetails?.duration}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-bold mb-2">Description</h3>
                                                <p className="text-gray-700">{jobDetails?.description}</p>
                                            </div>

                                            <div>
                                                <h3 className="font-bold mb-2">Your Application Status</h3>
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${selectedApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                        selectedApplication.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {selectedApplication.status}
                                                </span>
                                                <p className="text-gray-600 mt-2">
                                                    Applied on: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">My Applications</h2>
                                        {applications.length === 0 ? (
                                            <p className="text-gray-500">No applications yet</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {applications.map((app) => (
                                                    <div
                                                        key={app.id}
                                                        onClick={() => handleApplicationClick(app)}
                                                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-lg font-semibold">Job ID: {app.jobId}</h3>
                                                                <p className="text-gray-600">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
                                                                app.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-800' :
                                                                    app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'
                                                                }`}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bookmarks Tab Content */}
                        {activeTab === 'bookmarks' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Bookmarked Jobs</h2>
                                {bookmarks.length === 0 ? (
                                    <p className="text-gray-500">No bookmarks yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bookmarks.map((bookmark) => (
                                            <div key={bookmark.id} className="border border-gray-200 rounded-lg p-4">
                                                <p className="text-lg font-semibold">Job ID: {bookmark.jobId}</p>
                                                <p className="text-gray-600">Bookmarked: {new Date(bookmark.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
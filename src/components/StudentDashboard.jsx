import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { student } from '../utils/api';
import { Upload, FileText, Briefcase, Bookmark } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [applications, setApplications] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, applicationsRes, bookmarksRes] = await Promise.all([
                student.getProfile(user.userId),
                student.getApplications(user.userId),
                student.getBookmarks(user.userId)
            ]);

            setProfile(profileRes.data.data);
            setFormData(profileRes.data.data);
            setApplications(applicationsRes.data.data);
            setBookmarks(bookmarksRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await student.updateProfile(user.userId, formData);
            setProfile(formData);
            setEditMode(false);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await student.uploadResume(user.userId, file);
                alert('Resume uploaded successfully!');
                fetchData();
            } catch (error) {
                alert('Failed to upload resume');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-6 py-3 ${activeTab === 'profile' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FileText className="inline mr-2" size={20} />
                            Profile
                        </button>
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
                        {activeTab === 'profile' && (
                            <div>
                                {!editMode ? (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold">My Profile</h2>
                                            <button
                                                onClick={() => setEditMode(true)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-gray-600 mb-1">Full Name</p>
                                                <p className="text-lg font-semibold">{user.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-1">Email</p>
                                                <p className="text-lg font-semibold">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-1">Phone</p>
                                                <p className="text-lg font-semibold">{profile?.phone || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-1">College</p>
                                                <p className="text-lg font-semibold">{profile?.college || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-1">Graduation Year</p>
                                                <p className="text-lg font-semibold">{profile?.graduationYear || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 mb-1">Resume</p>
                                                {profile?.resumeUrl ? (
                                                    <a href={`http://localhost:8080${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                                                        View Resume
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-500">Not uploaded</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <p className="text-gray-600 mb-2">Bio</p>
                                            <p className="text-lg">{profile?.bio || 'No bio provided'}</p>
                                        </div>

                                        <div className="mt-6">
                                            <p className="text-gray-600 mb-2">Skills</p>
                                            <p className="text-lg">{profile?.skills || 'No skills listed'}</p>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-gray-700 mb-2">Upload New Resume</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                                className="border border-gray-300 rounded-lg p-2"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpdateProfile}>
                                        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-gray-700 mb-2">Phone</label>
                                                <input
                                                    type="tel"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    value={formData.phone || ''}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">College</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    value={formData.college || ''}
                                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">Graduation Year</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    value={formData.graduationYear || ''}
                                                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">Education</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    value={formData.education || ''}
                                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">Bio</label>
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                rows="4"
                                                value={formData.bio || ''}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">Skills (comma-separated)</label>
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                rows="3"
                                                value={formData.skills || ''}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(false)}
                                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">My Applications</h2>
                                {applications.length === 0 ? (
                                    <p className="text-gray-500">No applications yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map((app) => (
                                            <div key={app.id} className="border border-gray-200 rounded-lg p-4">
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
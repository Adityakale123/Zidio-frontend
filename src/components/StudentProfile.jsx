import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { student } from '../utils/api';
import { Upload } from 'lucide-react';

const StudentProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await student.getProfile(user.userId);
            setProfile(response.data.data);
            setFormData(response.data.data || {});
        } catch (error) {
            console.error('Error fetching profile:', error);
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
                fetchProfile();
            } catch (error) {
                alert('Failed to upload resume');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
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
            </div>
        </div>
    );
};

export default StudentProfile;

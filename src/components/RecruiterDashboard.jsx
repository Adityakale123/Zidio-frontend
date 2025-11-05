import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recruiter } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Users, FileText, Eye, Download,
    CheckCircle, XCircle, Clock, Mail, Phone,
    GraduationCap, Calendar, BookOpen
} from 'lucide-react';
import CreateJobModal from './CreateJobModal';

const RecruiterDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [myJobs, setMyJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [activeTab, setActiveTab] = useState('jobs');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    // Redirect non-recruiter users away and fetch jobs when we have the user
    useEffect(() => {
        if (!user) return;
        // If role is not recruiter, redirect (replace so back button doesn't go back to previous auth pages)
        if (user.role !== 'RECRUITER') {
            const target = user.role === 'STUDENT' ? '/student-dashboard' : '/login';
            navigate(target, { replace: true });
            return;
        }
        fetchMyJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchMyJobs = async () => {
        try {
            const response = await recruiter.getMyJobs(user.userId);
            setMyJobs(response.data.data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async (jobId) => {
        try {
            const response = await recruiter.getApplications(user.userId, jobId);
            setApplications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleViewApplications = (job) => {
        setSelectedJob(job);
        fetchApplications(job.id);
        setActiveTab('applications');
    };

    const handleCreate = async (jobData) => {
        if (!user) {
            alert('You must be logged in');
            return;
        }
        setCreating(true);
        try {
            await recruiter.createJob(user.userId, jobData);
            alert('Job created successfully');
            setShowCreateModal(false);
            fetchMyJobs();
        } catch (err) {
            console.error('Create job error', err);
            alert(err.response?.data?.message || 'Failed to create job');
        } finally {
            setCreating(false);
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            await recruiter.updateApplicationStatus(user.userId, applicationId, status);
            alert(`Application ${status.toLowerCase()} successfully!`);
            fetchApplications(selectedJob.id);
        } catch (error) {
            alert('Failed to update application status');
        }
    };

    // Try to open the latest resume for a student (best-effort fetch of latest student data)
    const handleDownloadResume = async (maybeResumeUrl, studentId) => {
        try {
            // If we have a studentId, attempt to fetch latest student profile (API variations handled defensively)
            let latestResume = maybeResumeUrl;
            if (studentId) {
                try {
                    // Try common candidate endpoints - adjust to your API shape if necessary
                    const res = await (recruiter.getStudent ? recruiter.getStudent(user.userId, studentId) : recruiter.getStudentById?.(studentId));
                    const latestStudent = res?.data?.data || res?.data || null;
                    if (latestStudent?.resumeUrl) latestResume = latestStudent.resumeUrl;
                } catch (e) {
                    // fallback: keep existing resumeUrl
                }
            }

            if (latestResume) {
                window.open(`http://localhost:8080${latestResume}`, '_blank');
            } else {
                alert('No resume available');
            }
        } catch (e) {
            console.error('Download resume error', e);
            alert('Failed to download resume');
        }
    };

    // When selecting an application, try to get the latest student profile and merge so UI shows most recent resume/fields
    const viewApplicationDetails = async (application) => {
        if (!application) return;
        let latestStudent = null;
        try {
            const studentId = application.student?.id;
            if (studentId) {
                const res = await (recruiter.getStudent ? recruiter.getStudent(user.userId, studentId) : recruiter.getStudentById?.(studentId));
                latestStudent = res?.data?.data || res?.data || null;
            }
        } catch (err) {
            // ignore and use the application snapshot
        }
        const merged = {
            ...application,
            student: {
                ...(application.student || {}),
                ...(latestStudent || {})
            }
        };
        setSelectedApplication(merged);
    };

    const handleLogout = () => {
        try { logout?.(); } catch (e) { /* ignore */ }
        try { localStorage.removeItem('token'); sessionStorage.clear(); } catch (e) { /* ignore */ }
        // Replace history so back button won't go to previous authenticated pages
        window.location.replace('/login');
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
                    <div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Create Job
                        </button>
                    </div>
                </div>


                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-3 rounded-lg ${activeTab === 'jobs'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600'
                            }`}
                    >
                        <Briefcase className="inline mr-2" size={20} />
                        My Jobs ({myJobs.length})
                    </button>
                    {selectedJob && (
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-6 py-3 rounded-lg ${activeTab === 'applications'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600'
                                }`}
                        >
                            <Users className="inline mr-2" size={20} />
                            Applications for {selectedJob.title}
                        </button>
                    )}
                </div>

                <CreateJobModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreate}
                    submitting={creating}
                />


                {activeTab === 'jobs' && (
                    <div className="grid gap-6">
                        {myJobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                                        <p className="text-gray-600 mb-4">{job.description}</p>
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            <span>📍 {job.location}</span>
                                            <span>💰 ₹{job.salary}</span>
                                            <span>📅 {job.duration}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewApplications(job)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        View Applications
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                {activeTab === 'applications' && (
                    <div className="grid lg:grid-cols-2 gap-6">

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Applications ({applications.length})
                            </h2>

                            {applications.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">
                                    No applications yet
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map((app) => (
                                        <div
                                            key={app.id}
                                            className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${selectedApplication?.id === app.id ? 'border-green-600 bg-green-50' : ''
                                                }`}
                                            onClick={() => viewApplicationDetails(app)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-lg">
                                                        {app.student?.fullName || 'Unknown'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {app.student?.email || 'No email'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">
                                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                            </p>

                                            <div className="flex gap-2 mt-3">
                                                {app.status === 'APPLIED' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(app.id, 'ACCEPTED');
                                                            }}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                                                        >
                                                            <CheckCircle className="inline mr-1" size={16} />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(app.id, 'REJECTED');
                                                            }}
                                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                                                        >
                                                            <XCircle className="inline mr-1" size={16} />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">Applicant Details</h2>

                            {selectedApplication ? (
                                <div className="space-y-6">

                                    <div>
                                        <h3 className="text-xl font-bold mb-3">
                                            {selectedApplication.student?.fullName || 'Unknown'}
                                        </h3>

                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-700">
                                                <Mail className="mr-3 text-green-600" size={20} />
                                                {selectedApplication.student?.email || 'No email'}
                                            </div>

                                            {selectedApplication.student?.phone && (
                                                <div className="flex items-center text-gray-700">
                                                    <Phone className="mr-3 text-green-600" size={20} />
                                                    {selectedApplication.student.phone}
                                                </div>
                                            )}

                                            {selectedApplication.student?.college && (
                                                <div className="flex items-center text-gray-700">
                                                    <GraduationCap className="mr-3 text-green-600" size={20} />
                                                    {selectedApplication.student.college}
                                                </div>
                                            )}

                                            {selectedApplication.student?.education && (
                                                <div className="flex items-center text-gray-700">
                                                    <BookOpen className="mr-3 text-green-600" size={20} />
                                                    {selectedApplication.student.education}
                                                </div>
                                            )}

                                            {selectedApplication.student?.graduationYear && (
                                                <div className="flex items-center text-gray-700">
                                                    <Calendar className="mr-3 text-green-600" size={20} />
                                                    Graduation: {selectedApplication.student.graduationYear}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    {selectedApplication.student?.bio && (
                                        <div>
                                            <h4 className="font-bold mb-2">Bio</h4>
                                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                                {selectedApplication.student.bio}
                                            </p>
                                        </div>
                                    )}


                                    {selectedApplication.student?.skills && (
                                        <div>
                                            <h4 className="font-bold mb-2">Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApplication.student.skills.split(',').map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                    {selectedApplication.coverLetter && (
                                        <div>
                                            <h4 className="font-bold mb-2">Cover Letter</h4>
                                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                                {selectedApplication.coverLetter}
                                            </p>
                                        </div>
                                    )}

                                    {/* Add status and action buttons */}
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold">Application Status:</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm ${selectedApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                selectedApplication.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {selectedApplication.status || 'PENDING'}
                                            </span>
                                        </div>

                                        {(!selectedApplication.status || selectedApplication.status === 'PENDING') && (
                                            <div className="flex gap-3 mb-4">
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedApplication.id, 'ACCEPTED')}
                                                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
                                                >
                                                    <CheckCircle className="inline mr-2" size={20} />
                                                    Accept Application
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedApplication.id, 'REJECTED')}
                                                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700"
                                                >
                                                    <XCircle className="inline mr-2" size={20} />
                                                    Reject Application
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleDownloadResume(selectedApplication.student?.resumeUrl, selectedApplication.student?.id)}
                                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                        >
                                            <Download className="mr-2" size={20} />
                                            Download Resume
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">
                                    Select an application to view details
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;
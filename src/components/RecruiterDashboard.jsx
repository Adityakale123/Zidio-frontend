import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recruiter } from '../utils/api';
import {
    Briefcase, Users, FileText, Eye, Download,
    CheckCircle, XCircle, Clock, Mail, Phone,
    GraduationCap, Calendar, BookOpen
} from 'lucide-react';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [myJobs, setMyJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [activeTab, setActiveTab] = useState('jobs');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyJobs();
    }, []);

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

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            await recruiter.updateApplicationStatus(user.userId, applicationId, status);
            alert(`Application ${status.toLowerCase()} successfully!`);
            fetchApplications(selectedJob.id);
        } catch (error) {
            alert('Failed to update application status');
        }
    };

    const handleDownloadResume = (resumeUrl) => {
        if (resumeUrl) {
            window.open(`http://localhost:8080${resumeUrl}`, '_blank');
        } else {
            alert('No resume available');
        }
    };

    const viewApplicationDetails = (application) => {
        setSelectedApplication(application);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Recruiter Dashboard</h1>

                {/* Tabs */}
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

                {/* Jobs Tab */}
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

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Applications List */}
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
                                                {app.status === 'PENDING' && (
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

                        {/* Application Details */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">Applicant Details</h2>

                            {selectedApplication ? (
                                <div className="space-y-6">
                                    {/* Student Info */}
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

                                    {/* Bio */}
                                    {selectedApplication.student?.bio && (
                                        <div>
                                            <h4 className="font-bold mb-2">Bio</h4>
                                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                                {selectedApplication.student.bio}
                                            </p>
                                        </div>
                                    )}

                                    {/* Skills */}
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

                                    {/* Cover Letter */}
                                    {selectedApplication.coverLetter && (
                                        <div>
                                            <h4 className="font-bold mb-2">Cover Letter</h4>
                                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                                {selectedApplication.coverLetter}
                                            </p>
                                        </div>
                                    )}

                                    {/* Resume Download */}
                                    <button
                                        onClick={() => handleDownloadResume(selectedApplication.student?.resumeUrl)}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                    >
                                        <Download className="mr-2" size={20} />
                                        Download Resume
                                    </button>
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

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { recruiter } from '../utils/api';
// import { Plus, Briefcase, Users, Edit, Trash2 } from 'lucide-react';

// const RecruiterDashboard = () => {
//     const { user } = useAuth();
//     const [jobs, setJobs] = useState([]);
//     const [activeTab, setActiveTab] = useState('jobs');
//     const [showJobForm, setShowJobForm] = useState(false);
//     const [selectedJob, setSelectedJob] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [jobForm, setJobForm] = useState({
//         title: '',
//         companyName: '',
//         description: '',
//         requirements: '',
//         type: 'JOB',
//         location: '',
//         salary: '',
//         duration: '',
//         applicationDeadline: '',
//         status: 'ACTIVE'
//     });

//     useEffect(() => {
//         fetchJobs();
//     }, []);

//     const fetchJobs = async () => {
//         try {
//             const res = await recruiter.getMyJobs(user.userId);
//             setJobs(res.data.data);
//         } catch (error) {
//             console.error('Error fetching jobs:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSubmitJob = async (e) => {
//         e.preventDefault();
//         try {
//             if (selectedJob) {
//                 await recruiter.updateJob(user.userId, selectedJob.id, jobForm);
//                 alert('Job updated successfully!');
//             } else {
//                 await recruiter.createJob(user.userId, jobForm);
//                 alert('Job created successfully!');
//             }
//             setShowJobForm(false);
//             setSelectedJob(null);
//             setJobForm({
//                 title: '',
//                 companyName: '',
//                 description: '',
//                 requirements: '',
//                 type: 'JOB',
//                 location: '',
//                 salary: '',
//                 duration: '',
//                 applicationDeadline: '',
//                 status: 'ACTIVE'
//             });
//             fetchJobs();
//         } catch (error) {
//             alert('Failed to save job');
//         }
//     };

//     const handleEditJob = (job) => {
//         setSelectedJob(job);
//         setJobForm(job);
//         setShowJobForm(true);
//     };

//     const handleDeleteJob = async (jobId) => {
//         if (window.confirm('Are you sure you want to delete this job?')) {
//             try {
//                 await recruiter.deleteJob(user.userId, jobId);
//                 alert('Job deleted successfully!');
//                 fetchJobs();
//             } catch (error) {
//                 alert('Failed to delete job');
//             }
//         }
//     };

//     if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="max-w-7xl mx-auto px-4 py-8">
//                 <div className="flex justify-between items-center mb-8">
//                     <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
//                     <button
//                         onClick={() => {
//                             setShowJobForm(true);
//                             setSelectedJob(null);
//                             setJobForm({
//                                 title: '',
//                                 companyName: '',
//                                 description: '',
//                                 requirements: '',
//                                 type: 'JOB',
//                                 location: '',
//                                 salary: '',
//                                 duration: '',
//                                 applicationDeadline: '',
//                                 status: 'ACTIVE'
//                             });
//                         }}
//                         className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
//                     >
//                         <Plus size={20} />
//                         Post New Job
//                     </button>
//                 </div>

//                 {showJobForm && (
//                     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                         <h2 className="text-2xl font-bold mb-4">{selectedJob ? 'Edit Job' : 'Create New Job'}</h2>
//                         <form onSubmit={handleSubmitJob}>
//                             <div className="grid md:grid-cols-2 gap-4 mb-4">
//                                 <div>
//                                     <label className="block text-gray-700 mb-2">Job Title*</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                         value={jobForm.title}
//                                         onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-gray-700 mb-2">Company Name*</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                         value={jobForm.companyName}
//                                         onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-gray-700 mb-2">Type*</label>
//                                     <select
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                         value={jobForm.type}
//                                         onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
//                                     >
//                                         <option value="JOB">Job</option>
//                                         <option value="INTERNSHIP">Internship</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-gray-700 mb-2">Location</label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                         value={jobForm.location}
//                                         onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-gray-700 mb-2">Salary</label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                         value={jobForm.salary}
//                                         onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-gray-700 mb-2">Duration</label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                         value={jobForm.duration}
//                                         onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-gray-700 mb-2">Description*</label>
//                                 <textarea
//                                     required
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                     rows="4"
//                                     value={jobForm.description}
//                                     onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-gray-700 mb-2">Requirements</label>
//                                 <textarea
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                                     rows="4"
//                                     value={jobForm.requirements}
//                                     onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
//                                 />
//                             </div>

//                             <div className="flex gap-4">
//                                 <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
//                                     {selectedJob ? 'Update Job' : 'Create Job'}
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setShowJobForm(false);
//                                         setSelectedJob(null);
//                                     }}
//                                     className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 )}

//                 <div className="bg-white rounded-lg shadow-md">
//                     <div className="p-6">
//                         <h2 className="text-2xl font-bold mb-6">My Job Postings ({jobs.length})</h2>

//                         {jobs.length === 0 ? (
//                             <p className="text-gray-500">No jobs posted yet</p>
//                         ) : (
//                             <div className="space-y-4">
//                                 {jobs.map((job) => (
//                                     <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
//                                         <div className="flex justify-between items-start">
//                                             <div className="flex-1">
//                                                 <h3 className="text-xl font-bold mb-2">{job.title}</h3>
//                                                 <p className="text-gray-600 mb-2">{job.companyName}</p>
//                                                 <div className="flex gap-4 text-sm text-gray-500 mb-2">
//                                                     <span>{job.type}</span>
//                                                     <span>•</span>
//                                                     <span>{job.location}</span>
//                                                     {job.salary && (
//                                                         <>
//                                                             <span>•</span>
//                                                             <span>{job.salary}</span>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                                 <p className="text-gray-700">{job.description.substring(0, 150)}...</p>
//                                             </div>
//                                             <div className="flex gap-2 ml-4">
//                                                 <button
//                                                     onClick={() => handleEditJob(job)}
//                                                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                                                 >
//                                                     <Edit size={20} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteJob(job.id)}
//                                                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                                                 >
//                                                     <Trash2 size={20} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RecruiterDashboard;
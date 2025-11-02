import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobs, student } from '../utils/api';
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from 'lucide-react';

const Jobs = () => {
    const { user } = useAuth();
    const [jobList, setJobList] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
    const [selectedJob, setSelectedJob] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [filters, setFilters] = useState({
        keyword: '',
        type: '',
        location: ''
    });

    useEffect(() => {
        fetchJobs();
        if (user && user.role === 'STUDENT') {
            fetchBookmarks();
        }
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await jobs.getAll();
            setJobList(res.data.data);
            setFilteredJobs(res.data.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookmarks = async () => {
        try {
            const res = await student.getBookmarks(user.userId);
            const bookmarkIds = new Set(res.data.data.map(b => b.jobId));
            setBookmarkedJobs(bookmarkIds);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const handleSearch = () => {
        let filtered = jobList;

        if (filters.keyword) {
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                job.description.toLowerCase().includes(filters.keyword.toLowerCase())
            );
        }

        if (filters.type) {
            filtered = filtered.filter(job => job.type === filters.type);
        }

        if (filters.location) {
            filtered = filtered.filter(job =>
                job.location && job.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        setFilteredJobs(filtered);
    };

    const handleToggleBookmark = async (jobId) => {
        if (!user || user.role !== 'STUDENT') {
            alert('Please login as a student to bookmark jobs');
            return;
        }

        try {
            await student.toggleBookmark(user.userId, jobId);
            if (bookmarkedJobs.has(jobId)) {
                bookmarkedJobs.delete(jobId);
            } else {
                bookmarkedJobs.add(jobId);
            }
            setBookmarkedJobs(new Set(bookmarkedJobs));
        } catch (error) {
            alert('Failed to toggle bookmark');
        }
    };

    const handleApply = async () => {
        if (!user || user.role !== 'STUDENT') {
            alert('Please login as a student to apply');
            return;
        }

        try {
            await student.applyToJob(user.userId, selectedJob.id, coverLetter);
            alert('Application submitted successfully!');
            setShowApplyModal(false);
            setCoverLetter('');
            setSelectedJob(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit application');
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Browse Jobs & Internships</h1>

                {/* Search Filters */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search by keyword..."
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">All Types</option>
                            <option value="JOB">Jobs</option>
                            <option value="INTERNSHIP">Internships</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Location"
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="grid gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <p className="text-gray-500">No jobs found</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold">{job.title}</h2>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${job.type === 'JOB' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {job.type}
                                            </span>
                                        </div>

                                        <p className="text-lg text-gray-600 mb-3">{job.companyName}</p>

                                        <div className="flex flex-wrap gap-4 text-gray-500 mb-4">
                                            {job.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={16} />
                                                    {job.location}
                                                </span>
                                            )}
                                            {job.salary && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={16} />
                                                    {job.salary}
                                                </span>
                                            )}
                                            {job.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    {job.duration}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-700 mb-4">{job.description}</p>

                                        {job.requirements && (
                                            <div className="mb-4">
                                                <h3 className="font-semibold mb-2">Requirements:</h3>
                                                <p className="text-gray-700">{job.requirements}</p>
                                            </div>
                                        )}
                                    </div>

                                    {user && user.role === 'STUDENT' && (
                                        <button
                                            onClick={() => handleToggleBookmark(job.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg ml-4"
                                        >
                                            {bookmarkedJobs.has(job.id) ? (
                                                <BookmarkCheck className="text-green-600" size={24} />
                                            ) : (
                                                <Bookmark className="text-gray-400" size={24} />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {user && user.role === 'STUDENT' && (
                                    <button
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setShowApplyModal(true);
                                        }}
                                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold mb-4">Apply for {selectedJob.title}</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Cover Letter (Optional)</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows="6"
                                placeholder="Tell us why you're a great fit for this position..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleApply}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                            >
                                Submit Application
                            </button>
                            <button
                                onClick={() => {
                                    setShowApplyModal(false);
                                    setSelectedJob(null);
                                    setCoverLetter('');
                                }}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
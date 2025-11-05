import React, { useState } from 'react';

const CreateJobModal = ({ isOpen, onClose, onSubmit, submitting }) => {
    const [form, setForm] = useState({
        title: '',
        companyName: '',
        description: '',
        location: '',
        salary: '',
        duration: '',
        type: 'JOB',
        requirements: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // basic client-side validation
        if (!form.title || !form.description || !form.companyName) {
            alert('Please fill required fields: Title, Company and Description');
            return;
        }
        onSubmit(form);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Create Job</h2>

                <div className="grid gap-2">
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Job Title *"
                        className="w-full mb-2 p-2 border rounded"
                    />

                    <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Company Name *"
                        className="w-full mb-2 p-2 border rounded"
                    />

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description *"
                        className="w-full mb-2 p-2 border rounded"
                        rows={5}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="Location"
                            className="p-2 border rounded"
                        />
                        <input
                            name="salary"
                            value={form.salary}
                            onChange={handleChange}
                            placeholder="Salary"
                            className="p-2 border rounded"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            name="duration"
                            value={form.duration}
                            onChange={handleChange}
                            placeholder="Duration"
                            className="p-2 border rounded"
                        />
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="p-2 border rounded"
                        >
                            <option value="JOB">JOB</option>
                            <option value="INTERNSHIP">INTERNSHIP</option>
                        </select>
                    </div>

                    <textarea
                        name="requirements"
                        value={form.requirements}
                        onChange={handleChange}
                        placeholder="Requirements (comma separated)"
                        className="w-full mb-2 p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div className="flex gap-3 mt-4">
                    <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">
                        {submitting ? 'Creating...' : 'Create Job'}
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateJobModal;

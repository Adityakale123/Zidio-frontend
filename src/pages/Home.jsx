import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Welcome to ZIDIOConnect
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Connecting Students with Dream Opportunities
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700">
                            Get Started
                        </Link>
                        <Link to="/jobs" className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg border-2 border-green-600 hover:bg-green-50">
                            Browse Jobs
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <Briefcase className="mx-auto mb-4 text-green-600" size={48} />
                        <h3 className="text-xl font-bold mb-2">Find Opportunities</h3>
                        <p className="text-gray-600">Browse thousands of internships and job postings</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <Users className="mx-auto mb-4 text-green-600" size={48} />
                        <h3 className="text-xl font-bold mb-2">Connect with Recruiters</h3>
                        <p className="text-gray-600">Direct communication with hiring companies</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <TrendingUp className="mx-auto mb-4 text-green-600" size={48} />
                        <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                        <p className="text-gray-600">Monitor your applications in real-time</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
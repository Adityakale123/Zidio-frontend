import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, Home } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-green-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold">ZIDIOConnect</Link>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="flex items-center gap-2 hover:text-green-200">
                                    <Home size={20} />
                                    Dashboard
                                </Link>
                                <Link to="/jobs" className="flex items-center gap-2 hover:text-green-200">
                                    <Briefcase size={20} />
                                    Jobs
                                </Link>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-2">
                                        <User size={20} />
                                        {user.fullName}
                                    </span>
                                    <button onClick={handleLogout} className="flex items-center gap-2 hover:text-green-200">
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-green-200">Login</Link>
                                <Link to="/register" className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
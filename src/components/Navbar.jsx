import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, Home } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown when clicking outside (only for recruiter view)
    useEffect(() => {
        if (user?.role !== 'RECRUITER') return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [user?.role]);

    const handleLogout = () => {
        try {
            logout();
            localStorage.removeItem('token');
            sessionStorage.clear();
            // Use replace and force a full page reload to clear history
            window.location.replace('/login');
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

    return (
        <nav className="bg-green-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold">ZIDIOConnect</Link>

                    <div className="flex items-center gap-6">
                        {!user ? (
                            <>
                                <Link to="/login" className="hover:text-green-200">Login</Link>
                                <Link to="/register" className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50">
                                    Register
                                </Link>
                            </>
                        ) : user.role === 'RECRUITER' ? (
                            <>
                                <Link to="/recruiter-dashboard" className="flex items-center gap-2 hover:text-green-200">
                                    <Home size={20} />
                                    Dashboard
                                </Link>

                                {/* Profile Icon Dropdown */}
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="w-8 h-8 rounded-full bg-white text-green-700 flex items-center justify-center hover:bg-green-50"
                                    >
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={20} />}
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Student View: Dashboard + Jobs + Profile Icon */}
                                <Link to="/dashboard" className="flex items-center gap-2 hover:text-green-200">
                                    <Home size={20} />
                                    Dashboard
                                </Link>
                                <Link to="/jobs" className="flex items-center gap-2 hover:text-green-200">
                                    <Briefcase size={20} />
                                    Jobs
                                </Link>

                                {/* Profile Dropdown with Profile link for students */}
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="w-8 h-8 rounded-full bg-white text-green-700 flex items-center justify-center hover:bg-green-50"
                                    >
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={20} />}
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    navigate('/student-profile');
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
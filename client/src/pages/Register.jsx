import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
    const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(credentials);
            navigate('/');
        } catch (err) {
            if (!err.response) {
                setError('Network error: Cannot connect to server. Please make sure the backend is running.');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rose-500 via-red-500 to-orange-500">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"></div>
            
            <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 shadow-inner">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                    <p className="text-red-100 mt-2">Join us to access emergency services</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-600/80 backdrop-blur-md text-white p-3 rounded-lg text-sm text-center border border-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-red-200" />
                            </div>
                            <input
                                type="text"
                                required
                                value={credentials.name}
                                onChange={e => setCredentials({ ...credentials, name: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-black/20 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition duration-200"
                                placeholder="Full Name"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-red-200" />
                            </div>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-black/20 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition duration-200"
                                placeholder="Username (Optional)"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-red-200" />
                            </div>
                            <input
                                type="email"
                                required
                                value={credentials.email}
                                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-black/20 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition duration-200"
                                placeholder="Email Address"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-red-200" />
                            </div>
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-black/20 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition duration-200"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-[1.02]"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-red-100">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-white hover:text-red-200 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

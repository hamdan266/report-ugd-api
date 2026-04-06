import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft, User, Mail, Phone, MapPin, Lock, Camera, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
        phone: user?.phone || '',
        address: user?.address || '',
        password: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(
        user?.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/${user.avatar}` : null
    );
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (formData.username) data.append('username', formData.username);
        if (formData.phone) data.append('phone', formData.phone);
        if (formData.address) data.append('address', formData.address);
        if (formData.password) data.append('password', formData.password);
        if (avatarFile) data.append('avatar', avatarFile);

        try {
            // Add headers with Content-Type undefined to strictly avoid Axios overriding with application/json
            const response = await api.post('/profile', data, {
                headers: {
                    'Content-Type': undefined,
                }
            });
            setUser(response.data);
            setSuccess('Profile updated successfully!');
            setFormData({ ...formData, password: '' }); // Clear password field
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ')
                : (err.response?.data?.message || 'Failed to update profile.');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                            <span className="font-semibold hidden sm:inline">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-8 h-8 text-rose-600" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-rose-600 to-orange-500">
                                My Profile
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={logout}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
                    {/* Decorative Header Background */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-r from-rose-500 to-orange-500"></div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center mb-8 pt-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-slate-300" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-transform transform hover:scale-105"
                                    title="Upload Profile Picture"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-slate-900">{user?.name}</h2>
                            <p className="text-sm font-medium text-slate-500 capitalize">{user?.role}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-sm text-center">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Full Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Username
                                </label>
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Home Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" /> New Password (leave blank to keep current)
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-linear-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/30 transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, MapPin, AlertTriangle, CheckCircle, Clock, ShieldAlert, User, Users, Pencil, Trash2, X, Save } from 'lucide-react';
import api from '../lib/axios';
import echo from '../lib/echo';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state (User only)
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locating, setLocating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit modal state (Pasien)
    const [editingReport, setEditingReport] = useState(null);
    const [editDescription, setEditDescription] = useState('');
    const [editLatitude, setEditLatitude] = useState('');
    const [editLongitude, setEditLongitude] = useState('');
    const [editLocating, setEditLocating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete confirm state
    const [deletingReportId, setDeletingReportId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Ref for scrolling to reports after submission
    const reportsRef = useRef(null);

    useEffect(() => {
        fetchReports();
        
        // WebSocket logic
        if (user.role === 'admin') {
            echo.private('admin.reports')
                .listen('NewReportSubmitted', (e) => {
                    setReports(prev => [e.report, ...prev]);
                })
                .listen('ReportStatusUpdated', (e) => {
                    setReports(prev => prev.map(r => r.id === e.report.id ? e.report : r));
                });
        } else {
            echo.private(`user.${user.id}`)
                .listen('ReportStatusUpdated', (e) => {
                    setReports(prev => prev.map(r => r.id === e.report.id ? e.report : r));
                });
        }

        return () => {
            if (user.role === 'admin') echo.leave('admin.reports');
            else echo.leave(`user.${user.id}`);
        };
    }, [user.id, user.role]);

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/reports');
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const getLocation = () => {
        setLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocating(false);
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    alert("Could not get location. Please allow location access.");
                    setLocating(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setLocating(false);
        }
    };

    const submitReport = async (e) => {
        e.preventDefault();
        if (!location.lat || !location.lng) return alert("Please get your location first!");

        setIsSubmitting(true);
        try {
            const { data } = await api.post('/reports', {
                description,
                latitude: location.lat,
                longitude: location.lng
            });
            setReports(prev => [data, ...prev]);
            setDescription('');
            setLocation({ lat: null, lng: null });

            // Auto-scroll to the reports list so user sees the new report
            setTimeout(() => {
                reportsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (error) {
            console.error('Failed to submit report', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const { data } = await api.put(`/reports/${id}`, { status });
            setReports(prev => prev.map(r => r.id === id ? data : r));
        } catch (error) {
            console.error('Update failed', error);
        }
    };

    // --- Pasien: Edit report ---
    const openEditModal = (report) => {
        setEditingReport(report);
        setEditDescription(report.description);
        setEditLatitude(report.latitude);
        setEditLongitude(report.longitude);
    };

    const closeEditModal = () => {
        setEditingReport(null);
        setEditDescription('');
        setEditLatitude('');
        setEditLongitude('');
    };

    const getEditLocation = () => {
        setEditLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setEditLatitude(pos.coords.latitude);
                    setEditLongitude(pos.coords.longitude);
                    setEditLocating(false);
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    alert("Could not get location. Please allow location access.");
                    setEditLocating(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setEditLocating(false);
        }
    };

    const saveEditReport = async () => {
        if (!editDescription.trim()) return;
        if (!editLatitude || !editLongitude) return alert("Location is required.");
        setIsUpdating(true);
        try {
            const { data } = await api.put(`/reports/${editingReport.id}`, {
                description: editDescription,
                latitude: editLatitude,
                longitude: editLongitude,
            });
            setReports(prev => prev.map(r => r.id === data.id ? data : r));
            closeEditModal();
        } catch (error) {
            console.error('Edit failed', error);
            alert(error.response?.data?.message || 'Failed to update report.');
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Pasien: Delete report ---
    const confirmDelete = (id) => {
        setDeletingReportId(id);
    };

    const cancelDelete = () => {
        setDeletingReportId(null);
    };

    const deleteReport = async () => {
        if (!deletingReportId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/reports/${deletingReportId}`);
            setReports(prev => prev.filter(r => r.id !== deletingReportId));
            setDeletingReportId(null);
        } catch (error) {
            console.error('Delete failed', error);
            alert(error.response?.data?.message || 'Failed to delete report.');
        } finally {
            setIsDeleting(false);
        }
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="flex items-center gap-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4" /> Pending</span>;
            case 'diproses': return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium"><AlertTriangle className="w-4 h-4" /> In Progress</span>;
            case 'selesai': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle className="w-4 h-4" /> Resolved</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-8 h-8 text-rose-600" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-rose-600 to-orange-500">
                                ER-System
                            </span>
                            {user.role === 'admin' && (
                                <span className="ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded uppercase font-bold tracking-wider">Admin</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {user.role === 'admin' && (
                                <Link to="/users" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Users className="w-4 h-4" /> <span className="hidden sm:inline">Manage Users</span>
                                </Link>
                            )}
                            <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors">
                                {user.avatar ? (
                                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/${user.avatar}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                ) : (
                                    <User className="w-8 h-8 p-1.5 bg-slate-100 rounded-full text-slate-500" />
                                )}
                                <span className="hidden md:inline">{user.name}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {user.role === 'pasien' && (
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b pb-4">Report an Emergency</h2>
                        <form onSubmit={submitReport} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700">Description of Emergency</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Please describe the situation clearly..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-linear-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/30 transition-all hover:shadow-lg disabled:opacity-50"
                                    disabled={!location.lat || !description || isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Emergency Report'}
                                </button>
                            </div>

                            <div className="space-y-4 flex flex-col">
                                <label className="block text-sm font-semibold text-slate-700">Your Location</label>
                                <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                                    {location.lat ? (
                                        <div className="space-y-2">
                                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MapPin className="w-8 h-8" />
                                            </div>
                                            <p className="font-semibold text-emerald-700">Location Acquired</p>
                                            <p className="text-xs text-slate-500 font-mono">
                                                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <MapPin className="w-12 h-12 text-slate-400 mb-4" />
                                            <p className="text-slate-500 mb-4 text-sm">We need your coordinates to send help.</p>
                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                disabled={locating}
                                                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-70"
                                            >
                                                {locating ? 'Locating...' : 'Get Current Location'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </section>
                )}

                <section ref={reportsRef}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 border-b pb-4 inline-block">
                            {user.role === 'admin' ? 'All Active Reports' : 'Your Reports History'}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent flex mx-auto rounded-full"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No reports found</h3>
                            <p className="text-slate-500 mt-1">Everything looks clear and safe.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {reports.map((report) => (
                                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            {user.role === 'admin' && (
                                                <p className="text-sm font-semibold text-slate-900 mb-1">{report.user?.name}</p>
                                            )}
                                            <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</p>
                                        </div>
                                        {renderStatusBadge(report.status)}
                                    </div>
                                    
                                    <p className="text-slate-700 mb-4 leading-relaxed flex-1">{report.description}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                                        <a
                                            href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            <MapPin className="w-4 h-4" /> View on Map
                                        </a>

                                        {/* Admin: Status Controls */}
                                        {user.role === 'admin' && (
                                            <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                <button 
                                                    onClick={() => updateStatus(report.id, 'pending')}
                                                    title="Tandai Pending"
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${report.status === 'pending' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-slate-400 hover:bg-slate-200 hover:text-orange-500'}`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(report.id, 'diproses')}
                                                    title="Tandai Sedang Proses"
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${report.status === 'diproses' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-200 hover:text-blue-500'}`}
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(report.id, 'selesai')}
                                                    title="Tandai Selesai"
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${report.status === 'selesai' ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-500'}`}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Pasien: Edit & Delete Buttons */}
                                        {user.role === 'pasien' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(report)}
                                                    title="Edit Report"
                                                    className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(report.id)}
                                                    title="Delete Report"
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ====== Edit Report Modal ====== */}
            {editingReport && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Edit Report</h3>
                            <button onClick={closeEditModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                    placeholder="Describe the emergency situation..."
                                />
                            </div>

                            {/* Latitude & Longitude */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={editLatitude}
                                        onChange={(e) => setEditLatitude(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
                                        placeholder="-6.12345"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={editLongitude}
                                        onChange={(e) => setEditLongitude(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
                                        placeholder="106.12345"
                                    />
                                </div>
                            </div>

                            {/* Re-locate Button */}
                            <button
                                type="button"
                                onClick={getEditLocation}
                                disabled={editLocating}
                                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <MapPin className="w-4 h-4" />
                                {editLocating ? 'Getting Location...' : 'Use Current Location'}
                            </button>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={closeEditModal}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEditReport}
                                disabled={isUpdating || !editDescription.trim() || !editLatitude || !editLongitude}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== Delete Confirmation Modal ====== */}
            {deletingReportId && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelDelete}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 sm:p-8 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Report?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            This action cannot be undone. The report will be permanently deleted.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteReport}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

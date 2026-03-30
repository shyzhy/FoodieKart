import { useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, login } = useAuth(); // We've stored login to reset token if needed, wait, we don't need to login again.
    const navigate = useNavigate();
    
    const [name, setName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
    
    // Status
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('full_name', name);
        formData.append('email', email);
        if (password) {
            formData.append('password', password);
        }
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            // Using POST to process multipart/form-data
            const { data } = await api.post('/user/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessMessage('Profile updated successfully! Refreshing...');
            
            // Wait 1.5s then force a reload so the AuthContext re-fetches the user model
            // thereby updating the Navbar and all other components natively.
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        // Fallback explicit logout logic since logout isn't destructured easily here for UI elements
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
            
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Decorative header */}
                <div className="h-32 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 w-full relative">
                    <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                </div>

                <div className="px-8 pb-10">
                    
                    {/* Avatar Bubble Overlapping Header */}
                    <div className="flex justify-between items-end -mt-16 mb-8 relative z-10">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white bg-clip-padding transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-emerald-50 text-emerald-600 font-black text-5xl flex items-center justify-center transition-transform group-hover:scale-105 uppercase">
                                    {name ? name[0] : '?'}
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 right-0 bg-gray-900 border-2 border-white text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md group-hover:bg-emerald-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div className="mb-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 font-extrabold uppercase tracking-widest text-xs rounded-lg border border-gray-200 shadow-inner">
                                {user?.role === 'admin' ? '🔥 Admin' : '👤 Customer'}
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Account Details</h1>
                        <p className="text-gray-500 font-medium">Update your secure access credentials and public profile.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-lg font-medium shadow-inner animate-fade-in">
                            <div className="flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg font-bold shadow-inner flex items-center gap-3 animate-fade-in">
                            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Firstname / Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center justify-between">
                                New Password
                                <span className="text-[10px] text-gray-400 font-normal normal-case tracking-normal">Leave blank to keep current password</span>
                            </label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none placeholder:text-gray-300"
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <button 
                                type="button"
                                onClick={handleLogout}
                                className="w-full sm:w-auto text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-bold px-6 py-3 rounded-xl transition-colors"
                            >
                                Sign Out
                            </button>
                            
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 active:bg-black text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Saving Profile...
                                    </>
                                ) : 'Save Modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

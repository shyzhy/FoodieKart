import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login({ email, password });
            navigate(data.user.role === 'admin' ? '/admin' : '/menu');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-emerald-50 via-orange-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 sm:p-10 relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <span className="text-5xl mb-4 block" role="img" aria-label="burger">🍔</span>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-gray-500 font-medium text-sm">Sign in to track your orders or manage your store.</p>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-semibold animate-shake">
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/70 border border-gray-200 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white text-gray-900 font-semibold"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>

                        </div>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/70 border border-gray-200 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white text-gray-900 font-bold tracking-widest"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 text-white font-black text-lg py-4 rounded-2xl mt-4 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:bg-emerald-600 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group">
                        Sign In
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm font-medium text-gray-500">
                    Don't have an account? <Link to="/register" className="text-emerald-600 font-black hover:text-emerald-700 transition-colors">Register here</Link>
                </p>
            </div>
        </div>
    );
}

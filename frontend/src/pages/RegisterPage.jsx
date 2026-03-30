import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        role: 'customer'
    });
    const [error, setError] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate(formData.role === 'admin' ? '/admin' : '/menu');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 bg-gray-50 relative overflow-hidden overflow-y-auto">
            {/* Decorative background blurs to keep it from looking plain */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 relative z-10 my-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">Create Account</h2>
                    <p className="text-gray-500 font-medium text-base">Join FoodieKart today and get fresh food easily.</p>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-semibold animate-shake">
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selector */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-2">
                        <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 transition-all ${formData.role === 'customer' ? 'border-emerald-500 bg-emerald-50 shadow-[0_2px_10px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500' : 'border-gray-100 hover:border-emerald-200 bg-white'}`}>
                            <div className="flex items-center justify-between pointer-events-none">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${formData.role === 'customer' ? 'bg-white' : 'bg-gray-50'}`}>🛍️</div>
                                    <div>
                                        <div className="font-black text-gray-900 text-sm tracking-tight mb-0.5">Customer</div>
                                        <div className="text-xs text-gray-500 font-bold">Order fresh food</div>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.role === 'customer' ? 'border-emerald-500' : 'border-gray-300'}`}>
                                    {formData.role === 'customer' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                </div>
                            </div>
                            <input type="radio" name="role" value="customer" className="hidden" onChange={handleChange} checked={formData.role === 'customer'} />
                        </label>

                        <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 transition-all ${formData.role === 'admin' ? 'border-gray-900 bg-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-gray-900' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                            <div className="flex items-center justify-between pointer-events-none">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${formData.role === 'admin' ? 'bg-white' : 'bg-gray-50'}`}>🏪</div>
                                    <div>
                                        <div className="font-black text-gray-900 text-sm tracking-tight mb-0.5">Store Admin</div>
                                        <div className="text-xs text-gray-500 font-bold">Manage restaurant</div>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.role === 'admin' ? 'border-gray-900' : 'border-gray-300'}`}>
                                    {formData.role === 'admin' && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
                                </div>
                            </div>
                            <input type="radio" name="role" value="admin" className="hidden" onChange={handleChange} checked={formData.role === 'admin'} />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <input name="full_name" type="text" required placeholder="John Doe" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white text-gray-900 font-semibold" onChange={handleChange} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input name="email" type="email" required placeholder="you@example.com" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white text-gray-900 font-semibold" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                            <input name="phone_number" type="tel" required placeholder="0919..." className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white text-gray-900 font-semibold" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <input name="password" type="password" required minLength="8" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white text-gray-900 font-bold tracking-widest" onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-500 text-white font-black text-lg py-4 rounded-xl mt-6 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:bg-emerald-600 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group">
                        Let's Go!
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm font-medium text-gray-500">
                    Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:underline transition-all">Log in here</Link>
                </p>
            </div>
        </div>
    );
}

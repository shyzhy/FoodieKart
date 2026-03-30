import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to get first name
    const getFirstName = (fullName) => {
        if (!fullName) return '';
        return fullName.split(' ')[0];
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    
                    {/* Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500 hover:opacity-90 transition-opacity">
                            FoodieKart <span className="text-orange-500 ml-1 drop-shadow-sm">🍔</span>
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                {/* Core Links */}
                                {isAdmin ? (
                                    <>
                                        <Link to="/admin/orders" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider">Kitchen Queue</Link>
                                        <Link to="/admin/menu" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider hidden sm:block">Menu Manager</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/menu" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider">Menu</Link>
                                        <Link to="/orders" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider hidden sm:block">Orders</Link>
                                        <Link to="/cart" className="relative group p-2 hover:bg-gray-50 rounded-full transition-colors flex items-center">
                                            <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                            {totalItems > 0 && (
                                                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-rose-500">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                <div className="h-8 w-px bg-gray-200 hidden sm:block mx-2"></div>

                                {/* User Welcome & Profile Action */}
                                <div className="flex items-center gap-4 ml-2">
                                    <Link 
                                        to="/profile" 
                                        className="flex items-center gap-3 group px-3 py-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                                    >
                                        <div className="hidden sm:flex flex-col items-end leading-tight">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {isAdmin ? 'Welcome, Admin' : 'Welcome back,'}
                                            </span>
                                            <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors capitalize">
                                                {getFirstName(user.full_name)}
                                            </span>
                                        </div>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-gray-100 group-hover:ring-emerald-200 transition-all" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-lg flex items-center justify-center shadow-sm ring-2 ring-gray-100 group-hover:ring-emerald-200 uppercase transition-all">
                                                {user.full_name ? user.full_name[0] : '?'}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Minimalist Logout Button */}
                                    <button 
                                        onClick={handleLogout}
                                        title="Log out"
                                        className="text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 p-2.5 rounded-full transition-colors hidden sm:block"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="text-sm font-bold bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:-translate-y-0.5">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

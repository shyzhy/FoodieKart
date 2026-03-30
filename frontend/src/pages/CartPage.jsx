import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const formattedItems = cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            await api.post('/orders', { items: formattedItems });
            clearCart();
            navigate('/orders', { state: { successMessage: 'Order placed successfully!' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-3xl mx-auto py-24 text-center px-4">
                <div className="text-8xl mb-6 opacity-80">🛒</div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h2>
                <p className="text-base sm:text-lg text-gray-500 mb-10">Looks like you haven't added any delicious food yet.</p>
                <button 
                    onClick={() => navigate('/menu')} 
                    className="bg-gray-900 text-white font-bold text-lg sm:text-xl px-8 sm:px-10 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
                >
                    Browse Our Menu
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-10 tracking-tight">Review Your Order</h1>

            {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 border border-rose-100 font-medium flex items-center shadow-sm"><svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.product_id} className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-gray-100 shadow-sm hover:border-gray-300 transition-colors">
                            <div className="flex-1 pr-4">
                                <h3 className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight mb-1">{item.name}</h3>
                                <p className="text-emerald-600 font-bold tracking-wide">₱{Number(item.price).toFixed(2)}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                                <div className="flex items-center gap-2 sm:gap-4 bg-gray-50 p-1 rounded-full border border-gray-200">
                                    <button
                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-gray-700 hover:text-gray-900 active:bg-gray-100 transition-colors"
                                        aria-label="Decrease quantity"
                                    >−</button>
                                    <span className="w-4 sm:w-6 text-center font-bold text-sm sm:text-base">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-gray-700 hover:text-gray-900 active:bg-gray-100 transition-colors"
                                        aria-label="Increase quantity"
                                    >+</button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product_id)}
                                    className="p-2 sm:p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors active:bg-rose-100 flex-shrink-0"
                                    title="Remove item"
                                    aria-label="Remove item"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1 border-t lg:border-t-0 p-4 lg:p-0 -mx-4 lg:mx-0">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 lg:sticky lg:top-24 border sm:border lg:border-gray-100 border-t-gray-200 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto z-40">
                        <div className="hidden sm:block">
                            <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4 text-gray-900">Order Summary</h3>

                            <div className="flex justify-between mb-3 text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">₱{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-6 text-gray-600">
                                <span>Delivery Fee</span>
                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-sm tracking-wide">FREE</span>
                            </div>
                        </div>

                        <div className="flex sm:flex-row justify-between items-center sm:items-start font-extrabold text-2xl sm:border-t sm:border-gray-100 sm:pt-6 mb-4 sm:mb-8 text-gray-900">
                            <span className="text-lg sm:text-2xl text-gray-500 sm:text-gray-900 font-semibold sm:font-extrabold">Total:</span>
                            <span className="text-emerald-600 text-2xl sm:text-3xl">₱{totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-lg sm:text-xl shadow-lg shadow-emerald-500/30 tracking-wide transition-all
                                ${isSubmitting
                                    ? 'bg-gray-400 shadow-none cursor-not-allowed text-white'
                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white active:scale-95'
                                }`}
                        >
                            {isSubmitting ? 'Processing...' : 'Place Order Now'}
                        </button>
                    </div>
                    {/* Spacer to prevent mobile content hiding behind fixed footer */}
                    <div className="h-32 sm:hidden block"></div>
                </div>
            </div>
        </div>
    );
}

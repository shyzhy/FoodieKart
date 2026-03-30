import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalOrder, setCancelModalOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrderClick = (orderId) => {
        setCancelModalOrder(orderId);
    };

    const confirmCancelOrder = async () => {
        if (!cancelModalOrder) return;
        setCancelling(true);
        try {
            await api.patch(`/orders/${cancelModalOrder}/cancel`);
            fetchOrders();
            setCancelModalOrder(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to cancel the order.');
        } finally {
            setCancelling(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styling = {
            'Pending': 'bg-blue-50 text-blue-700',
            'Preparing': 'bg-amber-50 text-amber-700',
            'Ready': 'bg-emerald-50 text-emerald-700',
            'Completed': 'bg-gray-100 text-gray-600 border border-gray-200 shadow-inner',
            'Cancelled': 'bg-rose-50 text-rose-700 border border-rose-100 shadow-inner'
        };
        const pulse = status === 'Ready' ? 'animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]' : '';
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${styling[status] || 'bg-gray-100 text-gray-700'} ${pulse}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading Your Order History...</div>;

    // Separate active and inactive orders
    const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
    const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

    const renderOrderCard = (order, isActive) => (
        <div key={order.order_id} className={`bg-white rounded-3xl p-6 shadow-sm border ${isActive ? 'border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.06)]' : 'border-gray-100'} transition-all hover:shadow-md mb-6`}>
            <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Order #{String(order.order_id).padStart(5, '0')}</div>
                    <div className="text-sm font-medium text-gray-900">
                        {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={order.status} />
                    {order.status === 'Pending' && (
                        <button 
                            onClick={() => handleCancelOrderClick(order.order_id)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {order.items.map(item => (
                    <div key={item.order_item_id} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm font-extrabold text-gray-600 border border-gray-100">
                                {item.quantity}
                            </span>
                            <span className="font-medium text-gray-800">{item.product.name}</span>
                        </div>
                        <span className="text-gray-500 font-medium tabular-nums shadow-sm bg-gray-50 px-2 py-0.5 rounded text-sm">
                            ₱{Number(item.subtotal).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">Total Amount</span>
                <span className="font-black text-2xl text-emerald-600 tracking-tight">₱{Number(order.total_amount).toFixed(2)}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-[800px] mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 tracking-tight">Your Orders</h1>
                
                {orders.length > 0 && (
                    <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto shadow-inner">
                        <button 
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-lg transition-all text-sm ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Active Orders
                            {activeOrders.length > 0 && <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-black ${activeTab === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>{activeOrders.length}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('past')}
                            className={`flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-lg transition-all text-sm ${activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Past Orders
                        </button>
                    </div>
                )}
            </div>
            
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
                    <span className="text-6xl mb-4 block opacity-50">🥡</span>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-6 font-medium">Looks like you haven't ordered anything yet.</p>
                    <Link to="/menu" className="inline-block bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-transform hover:-translate-y-0.5 shadow-lg shadow-gray-200">
                        Browse Menu
                    </Link>
                </div>
            ) : (
                <div className="animate-fade-in space-y-6">
                    {activeTab === 'active' && (
                        activeOrders.length > 0 ? (
                            activeOrders.map(order => renderOrderCard(order, true))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="text-4xl mb-3 block opacity-40">🧑‍🍳</span>
                                <p className="text-gray-500 font-medium tracking-wide">You have no active orders right now.</p>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'past' && (
                        pastOrders.length > 0 ? (
                            pastOrders.map(order => renderOrderCard(order, false))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="text-4xl mb-3 block opacity-40">📜</span>
                                <p className="text-gray-500 font-medium tracking-wide">Your order history is empty.</p>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Cancellation Modal */}
            {cancelModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative animate-scale-in">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto shadow-inner border border-rose-100">
                            🥡
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">Cancel Order?</h3>
                        <p className="text-gray-500 text-center mb-8 font-medium">
                            Are you sure you want to completely cancel Order <span className="font-bold text-gray-700">#{String(cancelModalOrder).padStart(5, '0')}</span>?
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmCancelOrder}
                                disabled={cancelling}
                                className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, cancel it'}
                            </button>
                            <button 
                                onClick={() => setCancelModalOrder(null)}
                                disabled={cancelling}
                                className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50"
                            >
                                No, keep my order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

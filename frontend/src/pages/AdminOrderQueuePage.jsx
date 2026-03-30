import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminOrderQueuePage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live');

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch admin order queue", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/admin/orders/${orderId}`, { status: newStatus });
            fetchOrders(); 
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getWaitTime = (createdAt) => {
        const diffMinutes = Math.floor((new Date() - new Date(createdAt)) / 60000);
        if (diffMinutes === 0) return 'Just now';
        return `${diffMinutes}m`;
    };

    if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading Dashboard...</div>;

    const liveColumns = [
        { title: 'Pending', status: 'Pending', borderClass: 'border-l-blue-500', buttonLabel: 'Start Preparing', nextStatus: 'Preparing', buttonClass: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/30' },
        { title: 'Preparing', status: 'Preparing', borderClass: 'border-l-amber-500', buttonLabel: 'Mark as Ready', nextStatus: 'Ready', buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/30' },
        { title: 'Ready', status: 'Ready', borderClass: 'border-l-emerald-500', buttonLabel: 'Order Picked Up', nextStatus: 'Completed', buttonClass: 'bg-gray-800 hover:bg-gray-900 text-white shadow-gray-500/30' },
    ];

    const historyOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    const completedCount = historyOrders.filter(o => o.status === 'Completed').length;
    const cancelledCount = historyOrders.filter(o => o.status === 'Cancelled').length;
    const totalRevenue = historyOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total_amount), 0);

    return (
        <div className="max-w-[1600px] mx-auto py-8 lg:py-12 px-4 sm:px-6">
            
            {/* Header and Navigation Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 tracking-tight">Kitchen Dashboard</h1>
                
                <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
                    <button 
                        onClick={() => setActiveTab('live')}
                        className={`flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-lg transition-all text-sm ${activeTab === 'live' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Live Queue
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-lg transition-all text-sm ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        History & Overview
                    </button>
                </div>
            </div>

            {/* Live Queue Tab */}
            {activeTab === 'live' && (
                <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-180px)] min-h-[600px] overflow-hidden animate-fade-in">
                    {liveColumns.map(col => {
                        const colOrders = orders.filter(o => o.status === col.status).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
                        
                        return (
                            <div key={col.title} className="flex-1 flex flex-col bg-gray-50/80 rounded-2xl p-4 lg:p-5 border border-gray-200/60 shadow-inner overflow-hidden">
                                <div className="flex items-center justify-between font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-3">
                                    <span>{col.title}</span>
                                    <span className="bg-white px-2.5 py-0.5 rounded-full text-sm shadow-sm border border-gray-100 text-gray-600">
                                        {colOrders.length}
                                    </span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth pb-2">
                                    {colOrders.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-xl">
                                            No {col.title.toLowerCase()} orders
                                        </div>
                                    ) : (
                                        colOrders.map(order => {
                                            const minsWaiting = Math.floor((new Date() - new Date(order.created_at)) / 60000);
                                            const isWaitingLong = col.status === 'Pending' && minsWaiting > 15;

                                            return (
                                                <div key={order.order_id} className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-[5px] ${col.borderClass} flex flex-col hover:shadow-md transition-shadow relative`}>
                                                    
                                                    <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/30 rounded-t-xl">
                                                        <div>
                                                            <h3 className="font-bold text-xl text-gray-900 tracking-tight leading-none mb-1">#{String(order.order_id).padStart(5, '0')}</h3>
                                                            <p className="text-sm font-medium text-gray-500">{order.user.full_name}</p>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${isWaitingLong ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                                                                {getWaitTime(order.created_at)}
                                                            </span>
                                                            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase">
                                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 flex-grow bg-white">
                                                        <ul className="space-y-2">
                                                            {order.items.map(item => (
                                                                <li key={item.order_item_id} className="flex justify-start items-start text-sm">
                                                                    <span className="font-extrabold text-emerald-600 w-6 shrink-0">{item.quantity}×</span>
                                                                    <span className="font-medium text-gray-700 leading-snug">{item.product.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {col.nextStatus ? (
                                                        <div className="p-3 bg-gray-50/50 border-t border-gray-100 rounded-b-xl">
                                                            <button
                                                                onClick={() => updateStatus(order.order_id, col.nextStatus)}
                                                                className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 ${col.buttonClass}`}
                                                            >
                                                                {col.buttonLabel}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 bg-emerald-50/50 border-t border-emerald-100 rounded-b-xl text-center">
                                                            <span className="font-bold tracking-wide text-emerald-700 text-sm">Waiting for customer</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="animate-fade-in space-y-8">
                    {/* Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
                                <p className="text-3xl font-black text-emerald-600">₱{totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-2xl">📈</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Completed</p>
                                <p className="text-3xl font-black text-gray-900">{completedCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 text-2xl">✅</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Cancelled</p>
                                <p className="text-3xl font-black text-rose-600">{cancelledCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-2xl">🛑</div>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Historical Orders</h2>
                        </div>
                        <div className="p-0">
                            {historyOrders.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">No historical orders found.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {historyOrders.map(order => (
                                        <div key={order.order_id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-xl text-gray-900">#{String(order.order_id).padStart(5, '0')}</h3>
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">{order.user.full_name}</p>
                                            </div>
                                            
                                            <div className="flex-1 max-w-md">
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                                                </p>
                                            </div>

                                            <div className="text-right flex flex-col items-end">
                                                <span className="font-black text-lg text-gray-900">₱{Number(order.total_amount).toFixed(2)}</span>
                                                <span className="text-xs text-gray-400 font-medium mt-1">
                                                    {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

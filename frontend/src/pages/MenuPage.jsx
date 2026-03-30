import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function MenuPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuTitle, setMenuTitle] = useState('Our Menu');
    const [menuSubtitle, setMenuSubtitle] = useState('Authentic Filipino flavors, delivered hot to your table.');
    const [activeCategory, setActiveCategory] = useState('All');
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            if (data.menu_title) setMenuTitle(data.menu_title);
            if (data.menu_subtitle) setMenuSubtitle(data.menu_subtitle);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            // Show only available products to customers
            setProducts(data.filter(p => p.is_available));
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category || 'Main Course'))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));

    const filteredProducts = activeCategory === 'All' 
        ? products 
        : products.filter(p => (p.category || 'Main Course') === activeCategory);

    if (loading) return <div className="text-center py-20 animate-pulse text-gray-500">Loading Menu...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{menuTitle}</h1>
            <p className="text-gray-500 mb-8">{menuSubtitle}</p>

            {/* Category Filter Pills */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                            activeCategory === cat 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 border-b-2 hover:border-b-gray-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                    <div key={product.product_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-row sm:flex-col group hover:shadow-md transition-shadow active:bg-gray-50 sm:active:bg-white">
                        <div className="w-32 sm:w-full h-auto sm:h-48 min-h-[128px] bg-gradient-to-br from-orange-100 via-red-50 to-rose-100 relative shrink-0 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0 z-0" loading="lazy" />
                            ) : (
                                <>
                                    {/* Decorative blur circle */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 sm:w-32 h-20 sm:h-32 bg-white/40 blur-2xl rounded-full"></div>
                                    {/* Placeholder for actual food images */}
                                    <span className="text-5xl sm:text-7xl group-hover:scale-110 transition-transform duration-500 relative z-10" role="img" aria-label="Food">🍲</span>
                                </>
                            )}
                        </div>
                        <div className="p-4 sm:p-6 flex flex-col flex-grow">
                            <span className="text-[10px] tracking-widest uppercase text-emerald-600 font-black mb-1">{product.category || 'Main Course'}</span>
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">{product.name}</h3>
                            <p className="text-gray-500 text-sm h-auto sm:h-10 line-clamp-2 mb-3 sm:mb-6 flex-grow">{product.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-50">
                                <span className="text-emerald-600 font-extrabold text-lg sm:text-2xl tracking-tight">₱{Number(product.price).toFixed(2)}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-10 h-10 sm:w-auto flex items-center justify-center sm:px-4 sm:py-2 rounded-full bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 active:scale-95 transition-transform"
                                    title="Add to Cart"
                                >
                                    <svg className="w-5 h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    <span className="hidden sm:inline">Add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        No products found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}

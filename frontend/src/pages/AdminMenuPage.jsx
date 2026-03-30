import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminMenuPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null); // id of product being edited, or 'new'

    // Form state (imageFile holds the actual File object)
    const [formData, setFormData] = useState({ name: '', description: '', category: 'Main Course', price: '', is_available: true, imageFile: null });
    
    // Header Settings State
    const [headerSettings, setHeaderSettings] = useState({ menu_title: 'Our Menu', menu_subtitle: 'Authentic Filipino flavors, delivered hot to your table.' });
    const [savingSettings, setSavingSettings] = useState(false);

    // Category Master List State
    const [categoriesList, setCategoriesList] = useState(['Main Course', 'Appetizer', 'Dessert', 'Beverages', 'Specialty', 'Side Dish']);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setHeaderSettings({
                menu_title: data.menu_title || 'Our Menu',
                menu_subtitle: data.menu_subtitle || 'Authentic Filipino flavors, delivered hot to your table.'
            });
            if (data.categories) {
                setCategoriesList(data.categories.split(','));
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product = null) => {
        if (product) {
            setFormData({ ...product, category: product.category || 'Main Course', imageFile: null }); // Don't reload old file
            setIsEditing(product.product_id);
        } else {
            setFormData({ name: '', description: '', category: 'Main Course', price: '', is_available: true, imageFile: null });
            setIsEditing('new');
        }
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({ name: '', description: '', category: 'Main Course', price: '', is_available: true, imageFile: null });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            if (formData.description) payload.append('description', formData.description);
            if (formData.category) payload.append('category', formData.category);
            payload.append('price', formData.price);
            payload.append('is_available', formData.is_available ? 1 : 0);
            
            if (formData.imageFile) {
                payload.append('image', formData.imageFile);
            }

            if (isEditing === 'new') {
                await api.post('/admin/products', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Laravel requires POST with _method=PUT to handle multipart/form-data updates properly
                payload.append('_method', 'PUT');
                await api.post(`/admin/products/${isEditing}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            fetchProducts();
            handleCancel();
        } catch (error) {
            console.error("Save error", error);
            alert('Failed to save product details.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            fetchProducts();
        } catch (error) {
            alert('Failed to delete product.');
        }
    };

    const toggleAvailability = async (product) => {
        try {
            await api.put(`/admin/products/${product.product_id}`, {
                ...product,
                is_available: !product.is_available
            });
            fetchProducts();
        } catch (error) {
            console.error("Failed to toggle status");
            alert('Failed to update availability status.');
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            // Include categories array organically in PUT
            await api.put('/admin/settings', { settings: { ...headerSettings, categories: categoriesList.join(',') } });
            // Show successful blink
            setSavingSettings('done');
            setTimeout(() => setSavingSettings(false), 2000);
        } catch (error) {
            alert("Failed to update header rules.");
            setSavingSettings(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        const updatedList = [...categoriesList, newCategoryName.trim()];
        try {
            await api.put('/admin/settings', { settings: { ...headerSettings, categories: updatedList.join(',') } });
            setCategoriesList(updatedList);
            setNewCategoryName('');
        } catch (error) {
            alert('Failed to add category');
        }
    };

    const handleRenameCategory = async (e) => {
        e.preventDefault();
        if (!editingCategory.newName.trim()) return;
        try {
            const { data } = await api.put('/admin/categories/rename', { 
                old_name: editingCategory.oldName, 
                new_name: editingCategory.newName.trim() 
            });
            setCategoriesList(data.categories.split(','));
            setEditingCategory(null);
            fetchProducts(); // Refresh to catch renamed products
        } catch (error) {
            alert('Failed to rename category');
        }
    };

    const handleDeleteCategory = async (name) => {
        if (!window.confirm(`Delete category "${name}"? Products under this category will become Uncategorized.`)) return;
        try {
            const { data } = await api.delete('/admin/categories/remove', { data: { name } });
            setCategoriesList(data.categories.split(','));
            fetchProducts();
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading Menu Manager...</div>;

    return (
        <div className="max-w-[1400px] mx-auto py-8 lg:py-12 px-4 sm:px-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8 mt-2">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 tracking-tight mb-2">Menu Management</h1>
                    <p className="text-gray-500 text-sm lg:text-base">Toggle item availability, update pricing, or customize the public header.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => handleEditClick()} 
                        className="bg-gray-900 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                )}
            </div>

            {/* Header Customization Banner */}
            <div className="bg-white border border-gray-200 rounded-2xl mb-10 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black text-gray-800 tracking-wider uppercase flex items-center gap-2">
                            <span className="text-xl">🖌️</span> Public Dashboard Header
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Update what customers see at the top of their menu.</p>
                    </div>
                </div>
                <form onSubmit={handleSaveSettings} className="p-6 flex flex-col md:flex-row gap-4 items-end bg-gradient-to-br from-white to-gray-50/50">
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Store Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-gray-900" 
                            value={headerSettings.menu_title}
                            onChange={e => setHeaderSettings({...headerSettings, menu_title: e.target.value})}
                        />
                    </div>
                    <div className="flex-1 w-full md:w-1/2">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Subtitle / Slogan</label>
                        <input 
                            type="text" 
                            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-600" 
                            value={headerSettings.menu_subtitle}
                            onChange={e => setHeaderSettings({...headerSettings, menu_subtitle: e.target.value})}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={savingSettings === true}
                        className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center min-w-[120px] ${savingSettings === 'done' ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'}`}
                    >
                        {savingSettings === true ? 'Saving...' : savingSettings === 'done' ? 'Saved! ✓' : 'Update Texts'}
                    </button>
                </form>
            </div>

            {/* Master Categories Banner */}
            <div className="bg-white border border-gray-200 rounded-2xl mb-10 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black text-gray-800 tracking-wider uppercase flex items-center gap-2">
                            <span className="text-xl">🏷️</span> Master Categories
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Manage filtering tabs available on the public dashboard.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-3 mb-6">
                        {categoriesList.map(cat => (
                            <div key={cat} className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-lg px-3 py-1.5 group hover:border-blue-300 transition-colors">
                                {editingCategory?.oldName === cat ? (
                                    <form onSubmit={handleRenameCategory} className="flex items-center gap-2">
                                        <input 
                                            autoFocus
                                            type="text"
                                            className="text-sm font-bold text-gray-900 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 outline-none w-[120px]"
                                            value={editingCategory.newName}
                                            onChange={e => setEditingCategory({...editingCategory, newName: e.target.value})}
                                        />
                                        <button type="submit" className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded p-1 text-xs font-bold" title="Save">✓</button>
                                        <button type="button" onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded p-1 text-xs" title="Cancel">✗</button>
                                    </form>
                                ) : (
                                    <>
                                        <span className="text-sm font-bold text-gray-700 select-none">{cat}</span>
                                        <div className="flex items-center ml-1 border-l border-gray-100 pl-1">
                                            <button onClick={() => setEditingCategory({ oldName: cat, newName: cat })} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Rename Category">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDeleteCategory(cat)} className="p-1 text-gray-400 hover:text-rose-600 transition-colors" title="Delete Category">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={handleAddCategory} className="flex gap-3 items-center max-w-sm">
                        <input 
                            type="text" 
                            required
                            placeholder="Add new category (e.g. Vegan)" 
                            className="flex-1 bg-white border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-800" 
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                        />
                        <button type="submit" className="bg-gray-900 text-white p-2.5 rounded-lg font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-sm flex items-center gap-1">
                            <span className="text-xl leading-none block -mt-0.5">+</span> Add
                        </button>
                    </form>
                </div>
            </div>

            {/* Inline Form */}
            {isEditing && (
                <div className="bg-white border border-emerald-100 p-6 sm:p-8 rounded-2xl mb-10 shadow-[0_8px_30px_rgb(16,185,129,0.06)] animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">{isEditing === 'new' ? 'Create New Product' : 'Edit Product'}</h2>
                    
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                            <input 
                                required 
                                type="text" 
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                                placeholder="e.g. Classic Chicken Adobo"
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea 
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none" 
                                rows="3" 
                                placeholder="Briefly describe the dish..."
                                value={formData.description || ''} 
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select 
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700" 
                                    value={formData.category} 
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categoriesList.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    {!categoriesList.includes(formData.category) && formData.category && (
                                        <option value={formData.category} className="hidden">{formData.category}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price (₱)</label>
                                <input 
                                    required 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono" 
                                    placeholder="0.00"
                                    value={formData.price} 
                                    onChange={e => setFormData({ ...formData, price: e.target.value })} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Photo</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="w-full bg-white border border-gray-200 p-[9px] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" 
                                onChange={e => setFormData({ ...formData, imageFile: e.target.files[0] })} 
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-end">
                            <label className="flex items-center space-x-3 h-[50px] w-full sm:w-1/2 cursor-pointer p-3 bg-gray-50 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                                    checked={formData.is_available} 
                                    onChange={e => setFormData({ ...formData, is_available: e.target.checked })} 
                                />
                                <span className="font-bold text-gray-700 select-none">Currently Available to Order</span>
                            </label>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
                            <button 
                                type="button" 
                                onClick={handleCancel} 
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-8 py-3 rounded-xl font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all"
                            >
                                {isEditing === 'new' ? 'Save Product' : 'Update changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Menu Grid Management Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map(product => (
                    <div 
                        key={product.product_id} 
                        className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative group transition-all duration-300 hover:shadow-md ${!product.is_available ? 'opacity-70 grayscale-[30%]' : ''}`}
                    >
                        
                        {/* Image Header Area */}
                        <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0 z-0" loading="lazy" />
                            ) : (
                                <>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/50 blur-xl rounded-full"></div>
                                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500 relative z-10" role="img" aria-label="Food">🍲</span>
                                </>
                            )}
                            
                            {!product.is_available && (
                                <div className="absolute top-3 right-3 bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm z-20">
                                    Sold Out
                                </div>
                            )}

                            {/* Floating Action Buttons for Edit/Delete (appear on hover) */}
                            <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md bg-white/95 p-1.5 rounded-xl shadow-sm z-20 border border-gray-100">
                                <button 
                                    onClick={() => handleEditClick(product)} 
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" 
                                    title="Edit Product"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button 
                                    onClick={() => handleDelete(product.product_id)} 
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" 
                                    title="Delete Product"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 flex flex-col h-[185px]">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">{product.category || 'Main Course'}</span>
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <h3 className="font-extrabold text-gray-900 leading-snug line-clamp-2">{product.name}</h3>
                            </div>
                            <span className="text-emerald-600 font-black text-lg tracking-tight mb-2">₱{Number(product.price).toFixed(2)}</span>
                            <p className="text-xs text-gray-500 line-clamp-2 flex-grow">{product.description}</p>
                            
                            {/* Toggle Switch Area */}
                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className={`text-xs font-bold uppercase tracking-wider ${product.is_available ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {product.is_available ? 'Available' : 'Unavailable'}
                                </span>
                                
                                <label className="relative inline-flex items-center cursor-pointer group/toggle" title="Toggle active status">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={product.is_available} 
                                        onChange={() => toggleAvailability(product)} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner group-hover/toggle:opacity-90"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {products.length === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-500 mt-8">
                    <span className="text-5xl block mb-4 opacity-50">📋</span>
                    <p className="text-lg font-bold text-gray-700">No products configured yet.</p>
                    <p className="text-sm">Click 'Add Product' to build your menu.</p>
                </div>
            )}
        </div>
    );
}

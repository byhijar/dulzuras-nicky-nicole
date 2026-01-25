import { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { createProduct, updateProduct, deleteProduct } from "../../services/adminService";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBoxOpen, FaShoppingBag, FaChartPie, FaSignOutAlt } from "react-icons/fa";
import AdminOrders from "../../components/admin/AdminOrders";
import { useToast } from "../../context/ToastContext";

function AdminDashboard() {
    const auth = getAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'products', 'orders'

    // Variants State
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "tortas",
        price: "",
        imageUrl: "",
        images: [], // Gallery
        stock: 0,
        isFeatured: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error loading products:", error);
            addToast("Error al cargar productos.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);

            // Parse existing sizes if any
            let parsedVariants = [];
            let hasSizes = false;

            if (product.sizes && Object.keys(product.sizes).length > 0) {
                hasSizes = true;
                parsedVariants = Object.entries(product.sizes).map(([name, price]) => ({
                    name,
                    price
                }));
            }

            setHasVariants(hasSizes);
            setVariants(parsedVariants.length > 0 ? parsedVariants : [{ name: "", price: "" }]);

            setFormData({
                name: product.name || "",
                description: product.description || "",
                category: product.category || "tortas",
                price: product.price || "",
                imageUrl: product.imageUrl || "",
                images: product.images || [], // Load existing gallery
                stock: product.stock || 0,
                isFeatured: product.isFeatured || false
            });
        } else {
            setEditingProduct(null);
            setHasVariants(false);
            setVariants([{ name: "", price: "" }]); // Start with 1 empty row
            setFormData({
                name: "",
                description: "",
                category: "tortas",
                price: "",
                imageUrl: "",
                images: [],
                stock: 0,
                isFeatured: false
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Process Variants
            let sizesObject = null;
            if (hasVariants) {
                sizesObject = {};
                variants.forEach(v => {
                    if (v.name && v.price) {
                        sizesObject[v.name] = Number(v.price);
                    }
                });
                // If empty valid variants, fallback to null
                if (Object.keys(sizesObject).length === 0) sizesObject = null;
            }

            const payload = {
                ...formData,
                price: formData.price ? Number(formData.price) : null,
                stock: Number(formData.stock) || 0,
                sizes: sizesObject // Add processed sizes
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                addToast("Producto actualizado correctamente", "success");
            } else {
                await createProduct(payload);
                addToast("Producto creado correctamente", "success");
            }

            handleCloseModal();
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error saving product:", error);
            addToast("Error al guardar el producto.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            await deleteProduct(id);
            addToast("Producto eliminado", "info");
            fetchProducts();
        } catch (error) {
            console.error("Delete error:", error);
            addToast("Error al eliminar.", "error");
        }
    };

    // Dashboard Stats
    const lowStockCount = products.filter(p => (p.stock || 0) < 5).length;
    const totalProducts = products.length;

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white shadow-xl hidden md:flex flex-col z-20">
                <div className="p-6 border-b flex items-center gap-3">
                    <img src="/logo-nicky-transparent.png" className="h-10 w-10 object-contain bg-purple-50 rounded-full" />
                    <h1 className="text-lg font-extrabold text-purple-800 tracking-tight">Panel Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FaChartPie /> Resumen
                    </button>
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'products' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FaBoxOpen /> Productos
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'orders' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FaShoppingBag /> Pedidos
                    </button>
                </nav>

                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-semibold">
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">v1.2.0 - Nicky Nicole</p>
                </div>
            </aside>

            {/* Mobile Header (Visible only on mobile) */}
            <div className="md:hidden fixed top-0 w-full bg-white shadow p-4 flex justify-between items-center z-30">
                <h1 className="font-bold text-gray-800">Panel Admin</h1>
                <button onClick={() => setActiveTab("dashboard")} className="text-purple-600"><FaChartPie /></button>
            </div>


            <main className="flex-1 p-6 md:p-10 overflow-y-auto mt-14 md:mt-0">
                {activeTab === "dashboard" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Hola, Nicky! 👋</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Total Productos</p>
                                <p className="text-3xl font-bold text-purple-700">{totalProducts}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Stock Crítico</p>
                                <p className="text-3xl font-bold text-red-500">{lowStockCount}</p>
                                <p className="text-xs text-gray-400 mt-2">Productos con menos de 5 unidades</p>
                            </div>
                            <div className="bg-purple-600 p-6 rounded-2xl shadow-lg text-white">
                                <p className="text-sm text-purple-100 font-medium mb-1">Acción Rápida</p>
                                <button
                                    onClick={() => { setActiveTab("products"); handleOpenModal(); }}
                                    className="mt-2 bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-50 transition w-full"
                                >
                                    + Crear Nuevo
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Últimos Pedidos</h3>
                            <AdminOrders limit={5} />
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Administrar Pedidos</h2>
                        <AdminOrders />
                    </div>
                )}


                {activeTab === "products" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition font-bold flex items-center gap-2"
                            >
                                <FaPlus /> Agregar
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Cargando productos...</div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                                        <tr>
                                            <th className="p-4 border-b">Producto</th>
                                            <th className="p-4 border-b">Categoría</th>
                                            <th className="p-4 border-b">Precio</th>
                                            <th className="p-4 border-b">Stock</th>
                                            <th className="p-4 border-b text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img
                                                        src={product.imageUrl || "/logo-nicky-transparent.png"}
                                                        className="w-10 h-10 object-cover rounded bg-gray-100"
                                                        alt="product"
                                                    />
                                                    <span className="font-medium text-gray-800">{product.name}</span>
                                                    {product.isFeatured && <span className="text-yellow-500 text-xs ml-2">★</span>}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${product.category === 'tortas' ? 'bg-pink-100 text-pink-700' :
                                                        product.category === 'vasos' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {product.price ? `$${product.price.toLocaleString()}` : 'Varía'}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {product.stock || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleOpenModal(product)}
                                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"
                                                        title="Editar"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal - Same as before but styled a bit cleaner if needed, reused logic */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none border"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full border-gray-300 rounded-lg p-2 outline-none border bg-white"
                                    >
                                        <option value="tortas">Tortas</option>
                                        <option value="vasos">Vasos</option>
                                        <option value="alfajores">Alfajores</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio Base</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full border-gray-300 rounded-lg p-2 outline-none border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Stock Disponible</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className="w-full border-gray-300 rounded-lg p-2 outline-none border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg p-2 outline-none border h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Galería de Imágenes</label>
                                <div className="space-y-3">
                                    {/* Main Image Input */}
                                    <div className="flex gap-2">
                                        <input
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            placeholder="URL Principal (https://...)"
                                            className="w-full border-gray-300 rounded-lg p-2 outline-none border text-sm"
                                        />
                                    </div>

                                    {/* Additional Images Manager */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Fotos Adicionales</label>

                                        {formData.images && formData.images.map((img, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    value={img}
                                                    onChange={(e) => {
                                                        const newImages = [...formData.images];
                                                        newImages[idx] = e.target.value;
                                                        setFormData(prev => ({ ...prev, images: newImages }));
                                                    }}
                                                    className="flex-1 border-gray-300 rounded p-1.5 text-sm outline-none border"
                                                    placeholder={`URL Foto Extra ${idx + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = formData.images.filter((_, i) => i !== idx);
                                                        setFormData(prev => ({ ...prev, images: newImages }));
                                                    }}
                                                    className="text-red-500 hover:text-red-700 px-2 font-bold"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ""] }))}
                                            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
                                        >
                                            <FaPlus size={10} /> Agregar otra foto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    id="featured"
                                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="featured" className="text-sm font-bold text-purple-800 cursor-pointer select-none">
                                    Destacar en Inicio ⭐
                                </label>
                            </div>

                            {/* VARIANTS / PACKS SECTION */}
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="hasVariants"
                                            checked={hasVariants}
                                            onChange={(e) => setHasVariants(e.target.checked)}
                                            className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
                                        />
                                        <label htmlFor="hasVariants" className="text-sm font-bold text-orange-900 cursor-pointer select-none">
                                            ¿Habilitar Packs / Opciones?
                                        </label>
                                    </div>
                                    <span className="text-xs text-orange-600 font-medium hidden md:block">
                                        (Ej: "Pack 12 un.", "Caja Regalo")
                                    </span>
                                </div>

                                {hasVariants && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {variants.map((variant, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    placeholder="Nombre (ej: Caja x6)"
                                                    value={variant.name}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[idx].name = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    className="flex-1 border-gray-300 rounded-lg p-2 text-sm outline-none border focus:border-orange-400"
                                                />
                                                <div className="relative w-32">
                                                    <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={variant.price}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[idx].price = e.target.value;
                                                            setVariants(newVariants);
                                                        }}
                                                        className="w-full pl-6 border-gray-300 rounded-lg p-2 text-sm outline-none border focus:border-orange-400"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newVariants = variants.filter((_, i) => i !== idx);
                                                        setVariants(newVariants);
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setVariants([...variants, { name: "", price: "" }])}
                                            className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 mt-2"
                                        >
                                            <FaPlus size={10} /> Agregar Opción
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;

import { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { createProduct, updateProduct, deleteProduct, uploadProductImage } from "../../services/adminService";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBoxOpen, FaShoppingBag, FaChartPie, FaSignOutAlt, FaUpload, FaCamera, FaExternalLinkAlt } from "react-icons/fa";
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

    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter products
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadProductImage(file);
            /* eslint-disable-next-line */
            console.log("Uploaded:", url);

            if (type === 'main') {
                setFormData(prev => ({ ...prev, imageUrl: url }));
            } else if (type === 'gallery') {
                setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
            }
            addToast("Imagen subida correctamente", "success");
        } catch (error) {
            console.error("Upload failed", error);
            addToast(`Error al subir imagen: ${error.message || 'Desconocido'}`, "error");
        } finally {
            setUploading(false);
        }
    };

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
                images: product.images || [],
                stock: product.stock || 0,
                isFeatured: product.isFeatured || false,
                filling: product.filling || "",
                ingredients: product.ingredients || ""
            });
        } else {
            setEditingProduct(null);
            setHasVariants(false);
            setVariants([{ name: "", price: "" }]);
            setFormData({
                name: "",
                description: "",
                category: "tortas",
                price: "",
                imageUrl: "",
                images: [],
                stock: 0,
                isFeatured: false,
                filling: "",
                ingredients: ""
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

    const validateForm = () => {
        const errors = [];
        if (!formData.name.trim()) {
            errors.push("El nombre del producto es obligatorio.");
        }
        
        // Clean price
        const cleanPrice = formData.price ? Number(String(formData.price).replace(/[^0-9]/g, "")) : 0;

        if (!hasVariants) {
            if (!formData.price || cleanPrice <= 0) {
                errors.push("Debes ingresar un precio base válido (mayor a 0) si no usas packs/opciones.");
            }
        } else {
            // Check variants
            const activeVariants = variants.filter(v => v.name.trim() !== "" || v.price !== "");
            if (activeVariants.length === 0) {
                errors.push("Habilitaste packs/opciones, pero no has agregado ninguno.");
            } else {
                activeVariants.forEach((v, index) => {
                    if (!v.name.trim()) {
                        errors.push(`El nombre del pack/opción #${index + 1} está vacío.`);
                    }
                    const vPrice = v.price ? Number(String(v.price).replace(/[^0-9]/g, "")) : 0;
                    if (!v.price || vPrice <= 0) {
                        errors.push(`El precio del pack/opción "${v.name || '#' + (index + 1)}" debe ser mayor a 0.`);
                    }
                });
            }
        }

        if (formData.isFeatured && !formData.imageUrl) {
            errors.push("Para destacar un producto en el Inicio, debes subir una imagen principal.");
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (errors.length > 0) {
            errors.forEach(err => addToast(err, "error"));
            return;
        }

        // Final confirmation if it's featured
        if (formData.isFeatured && !window.confirm("¿Estás segura de destacar este producto en la página principal?")) {
            return;
        }

        setUploading(true);
        try {
            // Process Variants
            let sizesObject = null;
            if (hasVariants) {
                sizesObject = {};
                variants.forEach(v => {
                    if (v.name && v.price) {
                        const cleanPrice = Number(String(v.price).replace(/[^0-9]/g, ""));
                        sizesObject[v.name.trim()] = cleanPrice;
                    }
                });
                if (Object.keys(sizesObject).length === 0) sizesObject = null;
            }

            // Clean price and stock
            const cleanBasePrice = formData.price ? Number(String(formData.price).replace(/[^0-9]/g, "")) : null;
            const cleanStock = Number(String(formData.stock).replace(/[^0-9]/g, "")) || 0;

            const payload = {
                ...formData,
                price: cleanBasePrice,
                stock: cleanStock,
                sizes: sizesObject,
                updatedAt: new Date()
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                addToast("✅ ¡Producto actualizado con éxito!", "success");
            } else {
                await createProduct(payload);
                addToast("✅ ¡Producto creado con éxito!", "success");
            }

            handleCloseModal();
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error saving product:", error);
            addToast("❌ Error al guardar el producto. Revisa tu conexión.", "error");
        } finally {
            setUploading(false);
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
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'}`}
                    >
                        <FaChartPie /> Resumen
                    </button>
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'products' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'}`}
                    >
                        <FaBoxOpen /> Productos
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'orders' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'}`}
                    >
                        <FaShoppingBag /> Pedidos
                    </button>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sitio Público</p>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100"
                        >
                            <div className="flex items-center gap-3">
                                <FaExternalLinkAlt />
                                <span>Ver Página</span>
                            </div>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                        </a>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-semibold">
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 font-medium uppercase tracking-tighter">v1.2.5 - Dulzuras Nicky Nicole</p>
                </div>
            </aside>

            {/* Mobile Header (Visible only on mobile) */}
            <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center z-30 border-b border-purple-50">
                <div className="flex items-center gap-2">
                    <img src="/logo-nicky-transparent.png" className="h-8 w-8 object-contain" />
                    <h1 className="font-bold text-purple-800">Dulzuras Nicky</h1>
                </div>
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-purple-600 flex items-center gap-1.5 text-sm font-bold border border-purple-200 px-3 py-1 rounded-xl bg-purple-50/50">
                    <FaExternalLinkAlt size={12} />
                    <span>Ver Sitio</span>
                </a>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-purple-100 flex justify-around items-center py-2 z-30 shadow-lg">
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-bold transition-all ${activeTab === 'dashboard' ? 'text-purple-700 scale-105' : 'text-gray-500 hover:text-purple-600'}`}
                >
                    <FaChartPie className="text-xl" />
                    <span>Resumen</span>
                </button>
                <button
                    onClick={() => setActiveTab("products")}
                    className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-bold transition-all ${activeTab === 'products' ? 'text-purple-700 scale-105' : 'text-gray-500 hover:text-purple-600'}`}
                >
                    <FaBoxOpen className="text-xl" />
                    <span>Productos</span>
                </button>
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-bold transition-all ${activeTab === 'orders' ? 'text-purple-700 scale-105' : 'text-gray-500 hover:text-purple-600'}`}
                >
                    <FaShoppingBag className="text-xl" />
                    <span>Pedidos</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                    <FaSignOutAlt className="text-xl" />
                    <span>Salir</span>
                </button>
            </div>


            <main className="flex-1 p-4 md:p-10 overflow-y-auto mt-14 md:mt-0 pb-20 md:pb-6">
                {activeTab === "dashboard" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-purple-700 to-pink-500 text-white shadow-xl shadow-purple-200">
                            <h2 className="text-4xl font-black mb-2">¡Hola, Nicky! ✨</h2>
                            <p className="text-purple-100 font-medium">Es un gran día para endulzar el mundo.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaBoxOpen /></div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Productos</p>
                                </div>
                                <p className="text-4xl font-black text-gray-800">{totalProducts}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FaTrash /></div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Stock Crítico</p>
                                </div>
                                <p className="text-4xl font-black text-red-500">{lowStockCount}</p>
                                <p className="text-xs text-gray-400 mt-2 font-medium">Menos de 5 unidades</p>
                            </div>
                            <div className="bg-white p-1 rounded-2xl shadow-lg border border-purple-100 flex items-center justify-center group overflow-hidden">
                                <button
                                    onClick={() => { setActiveTab("products"); handleOpenModal(); }}
                                    className="w-full h-full bg-purple-600 text-white rounded-[14px] p-6 font-bold text-lg hover:bg-purple-700 transition-all flex flex-col items-center justify-center gap-2 group-hover:scale-[1.02]"
                                >
                                    <FaPlus className="text-2xl" />
                                    <span>Crear Producto</span>
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
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>

                            <div className="flex gap-2 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 w-full"
                                />
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition font-bold flex items-center gap-2 shrink-0"
                                >
                                    <FaPlus /> Agregar
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Cargando productos...</div>
                        ) : (
                            <div>
                                {/* Mobile Card View (visible only on mobile) */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <img
                                                    src={product.imageUrl || "/logo-nicky-transparent.png"}
                                                    className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                                                    alt="product"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${product.category === 'tortas' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                                                            product.category === 'vasos' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'
                                                            }`}>
                                                            {product.category}
                                                        </span>
                                                        {product.isFeatured && (
                                                            <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight">
                                                                ★ Destacado
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 text-base truncate">{product.name}</h4>
                                                    <p className="text-sm font-semibold text-purple-600 mt-0.5">
                                                        {product.price ? `$${product.price.toLocaleString()}` : 'Varía'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Stock:</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                        <span className={`font-black text-sm ${product.stock < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                                                            {product.stock || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(product)}
                                                        className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition"
                                                    >
                                                        <FaEdit size={14} />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition"
                                                    >
                                                        <FaTrash size={14} />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table View (hidden on mobile) */}
                                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                                            {filteredProducts.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img
                                                            src={product.imageUrl || "/logo-nicky-transparent.png"}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "/logo-nicky-transparent.png";
                                                                e.target.className = "w-10 h-10 object-contain rounded bg-purple-50 p-1";
                                                            }}
                                                            className="w-10 h-10 object-cover rounded bg-gray-100"
                                                            alt="product"
                                                        />
                                                        <span className="font-medium text-gray-800">{product.name}</span>
                                                        {product.isFeatured && <span className="text-yellow-500 text-xs ml-2">★</span>}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${product.category === 'tortas' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                                                            product.category === 'vasos' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'
                                                            }`}>
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-600">
                                                        {product.price ? `$${product.price.toLocaleString()}` : 'Varía'}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                            <span className={`font-bold text-sm ${product.stock < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                                                                {product.stock || 0}
                                                            </span>
                                                        </div>
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
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] md:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom md:zoom-in-95 duration-250">
                        {/* Sticky Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50 sticky top-0 z-10 rounded-t-3xl md:rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingProduct ? "Editar Producto ✨" : "Nuevo Producto ✨"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 pb-10">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del Producto</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none border transition-all bg-white shadow-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Categoría</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full border-gray-300 rounded-xl py-3 px-4 text-base outline-none border bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                                    >
                                        <option value="tortas">Tortas</option>
                                        <option value="vasos">Vasos</option>
                                        <option value="alfajores">Alfajores</option>
                                        <option value="cocteleria">Coctelería</option>
                                        <option value="otros">Otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio Base</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500 text-base font-bold">$</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full border-gray-300 rounded-xl py-3 pl-8 pr-4 text-base outline-none border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Subtitle Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Relleno (Subtítulo principal)</label>
                                    <input
                                        name="filling"
                                        value={formData.filling || ""}
                                        onChange={handleChange}
                                        placeholder="Ej: Chantilly + Manjar"
                                        className="w-full border-gray-300 rounded-xl py-3 px-4 text-base outline-none border placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ingredientes / Detalles</label>
                                    <input
                                        name="ingredients"
                                        value={formData.ingredients || ""}
                                        onChange={handleChange}
                                        placeholder="Ej: Bizcocho vainilla, remojo 3 leches"
                                        className="w-full border-gray-300 rounded-xl py-3 px-4 text-base outline-none border placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Disponible</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 text-base outline-none border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 text-base outline-none border h-28 resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Imagen Principal</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            placeholder="Pegar enlace de imagen..."
                                            className="w-full border-gray-300 rounded-xl py-3 pl-10 pr-4 text-base outline-none border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                                        />
                                        <FaCamera className="absolute left-3.5 top-4 text-gray-400" />
                                    </div>

                                    <label className={`cursor-pointer bg-purple-100 text-purple-700 px-5 py-3 rounded-xl font-bold text-base hover:bg-purple-200 transition flex items-center justify-center gap-2 active:scale-95 shrink-0 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <FaUpload />
                                        <span>{uploading ? 'Subiendo...' : 'Subir'}</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            disabled={uploading}
                                            onChange={(e) => handleImageUpload(e, 'main')}
                                        />
                                    </label>
                                </div>
                                {formData.imageUrl && (
                                    <div className="mt-3 relative inline-block">
                                        <img src={formData.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-2xl border-2 border-purple-100 shadow-md" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Galería de Imágenes (Fotos Adicionales)</label>
                                <div className="space-y-3">
                                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/60 shadow-inner">
                                        {formData.images && formData.images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                {formData.images.map((img, idx) => (
                                                    <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-purple-100 bg-white aspect-square shadow-sm">
                                                        {img ? (
                                                            <img src={img} className="w-full h-full object-cover" alt="Gallery item" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-2 text-center bg-gray-50">
                                                                Subiendo...
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = formData.images.filter((_, i) => i !== idx);
                                                                setFormData(prev => ({ ...prev, images: newImages }));
                                                            }}
                                                            className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <label className={`cursor-pointer text-xs font-bold text-purple-700 bg-white border border-purple-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-purple-50 transition w-full flex items-center justify-center gap-1.5 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <FaUpload size={12} />
                                            <span>{uploading ? 'Subiendo...' : 'Subir Foto Extra'}</span>
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                disabled={uploading}
                                                onChange={(e) => handleImageUpload(e, 'gallery')}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    id="featured"
                                    className="w-6 h-6 rounded-lg text-purple-600 focus:ring-purple-500 border-purple-200 cursor-pointer"
                                />
                                <label htmlFor="featured" className="text-base font-bold text-purple-800 cursor-pointer select-none">
                                    Destacar en Inicio ⭐
                                </label>
                            </div>

                            {/* VARIANTS / PACKS SECTION */}
                            <div className="bg-orange-50/75 p-5 rounded-2xl border border-orange-100 shadow-inner">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="hasVariants"
                                            checked={hasVariants}
                                            onChange={(e) => setHasVariants(e.target.checked)}
                                            className="w-6 h-6 rounded-lg text-orange-600 focus:ring-orange-500 border-orange-200 cursor-pointer"
                                        />
                                        <label htmlFor="hasVariants" className="text-base font-bold text-orange-950 cursor-pointer select-none">
                                            ¿Habilitar Packs / Opciones?
                                        </label>
                                    </div>
                                </div>

                                {hasVariants && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {variants.map((variant, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                <input
                                                    placeholder="Nombre (ej: Caja x6)"
                                                    value={variant.name}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[idx].name = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    className="flex-1 border-gray-300 rounded-lg p-2.5 text-base outline-none border focus:border-orange-400"
                                                />
                                                <div className="relative w-28">
                                                    <span className="absolute left-2.5 top-2.5 text-gray-500 text-base font-bold">$</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        placeholder="0"
                                                        value={variant.price}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[idx].price = e.target.value;
                                                            setVariants(newVariants);
                                                        }}
                                                        className="w-full pl-6 border-gray-300 rounded-lg p-2.5 text-base outline-none border focus:border-orange-400"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newVariants = variants.filter((_, i) => i !== idx);
                                                        setVariants(newVariants);
                                                    }}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setVariants([...variants, { name: "", price: "" }])}
                                            className="text-sm font-bold text-orange-800 hover:text-orange-950 flex items-center gap-1.5 mt-2 bg-orange-100/75 hover:bg-orange-100 px-4 py-2 rounded-xl transition"
                                        >
                                            <FaPlus size={12} /> Agregar Opción
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Sticky Modal Footer */}
                        <div className="p-4 border-t bg-gray-50 flex gap-3 sticky bottom-0 z-10 rounded-b-3xl md:rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex-1 md:flex-none px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-base border border-gray-200 text-center"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                disabled={uploading}
                                className={`flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:opacity-95 transition text-base flex items-center justify-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;

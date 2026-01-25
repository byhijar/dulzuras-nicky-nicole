import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { subscribeToUserOrders } from "../../services/orderService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useToast } from "../../context/ToastContext";
import { FaBox, FaTruck, FaCheckCircle, FaClipboardList, FaClock, FaUserEdit, FaSave, FaTimes } from "react-icons/fa";

// Status Steps Configuration
const STEPS = [
    { key: "pendiente", label: "Pendiente", icon: FaClock },
    { key: "en_proceso", label: "Preparando", icon: FaClipboardList },
    { key: "listo", label: "Listo", icon: FaCheckCircle },
    { key: "entregado", label: "Entregado", icon: FaTruck },
];

function ClientDashboard() {
    const auth = getAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: "",
        phone: "",
        email: ""
    });

    // 1. Auth Listener (Fixes Redirect Loop)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setProfileData(prev => ({ ...prev, email: currentUser.email, fullName: currentUser.displayName || "" }));

                // Fetch extended profile
                try {
                    const docSnap = await getDoc(doc(db, "users", currentUser.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setProfileData(prev => ({
                            ...prev,
                            fullName: data.fullName || currentUser.displayName || "",
                            phone: data.phone || ""
                        }));
                    }
                } catch (e) {
                    console.error("Error fetching profile", e);
                }

            } else {
                navigate("/login");
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // 2. Orders Subscription
    useEffect(() => {
        if (!user) return;

        setLoadingOrders(true);
        const unsubscribe = subscribeToUserOrders(user.uid, (data) => {
            setOrders(data);
            setLoadingOrders(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const handleSaveProfile = async () => {
        try {
            await setDoc(doc(db, "users", user.uid), {
                fullName: profileData.fullName,
                phone: profileData.phone,
                email: profileData.email
            }, { merge: true });

            setIsEditing(false);
            addToast("Perfil actualizado correctamente", "success");
        } catch (error) {
            console.error("Error saving profile:", error);
            addToast("Error al actualizar perfil", "error");
        }
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "Por confirmar";
        let dateObj;
        // Handle Firestore Timestamp
        if (dateInput.seconds) {
            dateObj = new Date(dateInput.seconds * 1000);
        } else {
            // Handle String YYYY-MM-DD
            // Create date object treating the string as local time (append time if needed to avoid UTC shift)
            const parts = dateInput.split('-');
            if (parts.length === 3) {
                dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
                return dateInput;
            }
        }
        return dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loadingAuth) return <div className="min-h-screen flex items-center justify-center text-purple-600">Cargando...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Perfil" className="w-16 h-16 rounded-full border-2 border-purple-100" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl font-bold">
                                {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Hola, {profileData.fullName || "Cliente"}</h1>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">

                {/* 1. Profile / Mis Datos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaUserEdit className="text-purple-500" /> Mis Datos
                        </h2>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-purple-600 text-sm font-bold hover:underline">
                                Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><FaTimes /></button>
                                <button onClick={handleSaveProfile} className="text-white bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow"><FaSave /></button>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                            {isEditing ? (
                                <input
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-purple-200 outline-none"
                                    placeholder="Tu nombre completo"
                                />
                            ) : (
                                <p className="font-medium text-gray-700">{profileData.fullName || "Sin nombre"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Teléfono / WhatsApp</label>
                            {isEditing ? (
                                <div className="flex items-center mt-1">
                                    <div className="bg-gray-100 border border-r-0 rounded-l px-3 py-2 text-gray-500 font-medium">
                                        +56
                                    </div>
                                    <input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full border rounded-r p-2 focus:ring-2 focus:ring-purple-200 outline-none"
                                        placeholder="912345678"
                                        type="tel"
                                        maxLength="9"
                                    />
                                </div>
                            ) : (
                                <p className="font-medium text-gray-700">{profileData.phone || "Sin teléfono"}</p>
                            )}
                        </div>
                    </div>
                    {isEditing && <p className="text-xs text-purple-500 mt-2">ℹ️ Estos datos se usarán para rellenar tus próximos pedidos.</p>}
                </div>

                {/* 2. Orders List */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📦</span> Mis Pedidos
                    </h2>

                    {loadingOrders ? (
                        <div className="text-center py-12 text-purple-600 animate-pulse">Cargando tus pedidos...</div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-dashed border-gray-300">
                            <FaBox className="mx-auto text-gray-300 text-6xl mb-4" />
                            <p className="text-gray-500 mb-4">Aún no has realizado pedidos.</p>
                            <button
                                onClick={() => navigate("/catalogo")}
                                className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition"
                            >
                                Ir al Catálogo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const currentStepIndex = STEPS.findIndex(s => s.key === order.status);

                                return (
                                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Fecha del Pedido</p>
                                                <p className="text-sm font-medium">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Entrega Estimada</p>
                                                <p className="text-sm font-medium">{formatDate(order.fechaEstimada)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                                                <p className="text-lg font-bold text-purple-700">${order.total?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-8">
                                                <div className="flex items-center justify-between relative">
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                                                    <div
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-500 transition-all duration-500 -z-0"
                                                        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                                                    ></div>
                                                    {STEPS.map((step, idx) => {
                                                        const isActive = idx <= currentStepIndex;
                                                        return (
                                                            <div key={step.key} className="flex flex-col items-center relative z-10 bg-white px-2">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-gray-300 text-gray-300"}`}>
                                                                    <step.icon size={14} />
                                                                </div>
                                                                <span className={`text-xs mt-2 font-medium ${isActive ? "text-purple-700" : "text-gray-400"}`}>{step.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Detalles:</h3>
                                            <div className="space-y-4">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-16 h-16 rounded-md object-cover bg-gray-200"
                                                            onError={(e) => e.target.src = '/logo-nicky-transparent.png'}
                                                        />
                                                        <div>
                                                            <p className="font-bold text-gray-800">{item.name}</p>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold">x{item.quantity}</span>
                                                                <span>{item.size || "Unidad"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-auto font-bold text-gray-600">
                                                            ${(item.price * item.quantity).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 px-6 py-3 flex justify-between items-center">
                                            <span className="text-xs text-purple-600 font-bold uppercase">Abono pagado: ${order.abono?.toLocaleString()}</span>
                                            <span className="text-xs text-purple-600 font-bold uppercase">Pendiente: ${(order.total - (order.abono || 0))?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClientDashboard;

import { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getUserOrders } from "../../services/orderService";

function ClientDashboard() {
    const auth = getAuth();
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        } else {
            navigate("/login");
        }
    }, [user]);

    const loadOrders = async () => {
        try {
            const data = await getUserOrders(user.uid);
            setOrders(data);
        } catch (error) {
            console.error("Eror loading orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    if (!user) return null; // Or loading spinner while redirecting

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
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Hola, {user.displayName || "Cliente"}</h1>
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

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 mt-10">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📦</span> Mis Pedidos
                </h2>

                {loading ? (
                    <div className="text-center py-12">Cargando tus pedidos...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">Aún no has realizado pedidos.</p>
                        <button
                            onClick={() => navigate("/catalogo")}
                            className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition"
                        >
                            Ir al Catálogo
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b pb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-purple-700 text-lg">
                                                {order.tipo === 'torta' ? '🎂 Torta Personalizada' :
                                                    order.tipo === 'vaso' ? '🍰 Torta en Vaso' : '🍪 Alfajores/Galletas'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'pagado' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'entregado' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Fecha de solicitud: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">${order.precio?.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Total estimado</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p><span className="font-semibold">Producto:</span> {order.producto}</p>
                                        {order.tamaño && <p><span className="font-semibold">Tamaño:</span> {order.tamaño}</p>}
                                    </div>
                                    <div>
                                        <p><span className="font-semibold">Entrega:</span> {order.fechaEstimada}</p>
                                        <p><span className="font-semibold">Abono:</span> ${order.abono?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientDashboard;

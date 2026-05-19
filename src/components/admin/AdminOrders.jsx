import { useState, useEffect } from "react";
import { getAdminOrders, updateOrderStatus } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";

const STATUS_OPTIONS = {
    pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200" },
    en_proceso: { label: "En Proceso", color: "bg-sky-100 text-sky-700 border-sky-200" },
    listo: { label: "Listo", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    entregado: { label: "Entregado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    cancelado: { label: "Cancelado", color: "bg-rose-100 text-rose-700 border-rose-200" }
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            console.error("Order fetch error:", error);

            // Debug Auth
            import("firebase/auth").then(({ getAuth }) => {
                const user = getAuth().currentUser;
                console.log("Current User:", user?.email, user?.uid);

                if (error.code === 'permission-denied') {
                    addToast(`Acceso denegado. Usuario: ${user?.email || 'Anónimo'}`, "error");
                } else {
                    addToast("Error al cargar pedidos. Verifica tu conexión.", "error");
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            // Update local state to reflect change immediately
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            addToast("Estado actualizado correctamente", "success");
        } catch (error) {
            addToast("No se pudo actualizar el estado", "error");
        }
    };

    if (loading) return <div className="text-center py-10">Cargando pedidos...</div>;

    return (
        <div className="space-y-4">
            {/* 🖥️ DESKTOP TABLE (Hidden on mobile) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4 border-b">Fecha</th>
                            <th className="p-4 border-b">Cliente</th>
                            <th className="p-4 border-b">Pedido</th>
                            <th className="p-4 border-b">Total</th>
                            <th className="p-4 border-b">Estado</th>
                            <th className="p-4 border-b text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => {
                            const nombre = order.cliente?.nombre || order.customerName || "Anónimo";
                            const correo = order.cliente?.correo || order.customerEmail || "";
                            const telefono = order.cliente?.telefono || "";
                            const whatsappUrl = telefono ? `https://wa.me/${telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${nombre}! Soy Nicky de Dulzuras. Te escribo por tu pedido...`)}` : null;

                            return (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                        <br />
                                        <span className="text-xs">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : ''}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{nombre}</div>
                                        <div className="text-xs text-gray-500">{correo}</div>
                                        {telefono && <div className="text-xs text-gray-500 mt-1">📱 {telefono}</div>}
                                    </td>
                                    <td className="p-4">
                                        <ul className="text-sm list-disc pl-4 text-gray-600">
                                            {order.items?.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.quantity}x {item.name}
                                                    {item.size && <span className="text-xs text-gray-400"> ({item.size})</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="p-4 font-bold text-gray-800">
                                        ${order.total ? order.total.toLocaleString() : 0}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${STATUS_OPTIONS[order.status]?.color || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                                            {STATUS_OPTIONS[order.status]?.label || order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-y-2">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer hover:bg-white"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="listo">Listo</option>
                                            <option value="entregado">Entregado</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                        
                                        {whatsappUrl && (
                                            <a 
                                                href={whatsappUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full inline-block text-center text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 py-1.5 rounded-lg transition-colors border border-green-200"
                                            >
                                                💬 WhatsApp
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        No hay pedidos registrados.
                    </div>
                )}
            </div>

            {/* 📱 MOBILE CARD LAYOUT (Hidden on desktop) */}
            <div className="md:hidden space-y-4">
                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        No hay pedidos registrados.
                    </div>
                )}
                {orders.map(order => {
                    const nombre = order.cliente?.nombre || order.customerName || "Anónimo";
                    const correo = order.cliente?.correo || order.customerEmail || "";
                    const telefono = order.cliente?.telefono || "";
                    const whatsappUrl = telefono ? `https://wa.me/${telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${nombre}! Soy Nicky de Dulzuras. Te escribo por tu pedido...`)}` : null;

                    return (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
                            {/* Header: Client & Date */}
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <div className="font-bold text-gray-800 text-lg">{nombre}</div>
                                    <div className="text-xs text-gray-500">{correo}</div>
                                    {telefono && <div className="text-xs text-gray-500 mt-1">📱 {telefono}</div>}
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-600">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Detalle del Pedido</p>
                                <ul className="text-sm list-disc pl-4 text-gray-700 space-y-1">
                                    {order.items?.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="font-semibold">{item.quantity}x</span> {item.name}
                                            {item.size && <span className="text-xs text-gray-500"> ({item.size})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Total & Status Badge */}
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Total:</span>
                                <span className="font-black text-lg text-purple-700">${order.total ? order.total.toLocaleString() : 0}</span>
                            </div>

                            {/* Actions: Status Dropdown & WhatsApp */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-wider text-center ${STATUS_OPTIONS[order.status]?.color || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                                        {STATUS_OPTIONS[order.status]?.label || order.status}
                                    </span>
                                    
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="flex-1 text-sm font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_proceso">En Proceso</option>
                                        <option value="listo">Listo</option>
                                        <option value="entregado">Entregado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                                
                                {whatsappUrl && (
                                    <a 
                                        href={whatsappUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full text-center text-sm font-bold bg-[#25D366] text-white hover:bg-[#1ebd5a] py-3 rounded-xl transition-colors shadow-md mt-1 flex items-center justify-center gap-2"
                                    >
                                        💬 Contactar por WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AdminOrders;

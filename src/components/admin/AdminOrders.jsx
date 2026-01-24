import { useState, useEffect } from "react";
import { getAdminOrders, updateOrderStatus } from "../../services/adminService";

const STATUS_OPTIONS = {
    pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    en_proceso: { label: "En Proceso", color: "bg-blue-100 text-blue-800" },
    listo: { label: "Listo", color: "bg-purple-100 text-purple-800" },
    entregado: { label: "Entregado", color: "bg-green-100 text-green-800" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" }
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            alert("Error al cargar pedidos");
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
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    if (loading) return <div className="text-center py-10">Cargando pedidos...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4 border-b">Fecha</th>
                            <th className="p-4 border-b">Cliente</th>
                            <th className="p-4 border-b">Pedido</th>
                            <th className="p-4 border-b">Total</th>
                            <th className="p-4 border-b">Estado</th>
                            <th className="p-4 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                    <br />
                                    <span className="text-xs">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : ''}</span>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-800">{order.customerName || "Anónimo"}</div>
                                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
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
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${STATUS_OPTIONS[order.status]?.color || "bg-gray-100 text-gray-800"}`}>
                                        {STATUS_OPTIONS[order.status]?.label || order.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_proceso">En Proceso</option>
                                        <option value="listo">Listo</option>
                                        <option value="entregado">Entregado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        No hay pedidos registrados.
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminOrders;

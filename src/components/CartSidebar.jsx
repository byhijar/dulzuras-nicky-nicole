import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { FaTimes, FaTrash, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CartSidebar() {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate("/checkout");
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaShoppingCart className="text-purple-600" /> Tu Carrito
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                                    <FaShoppingCart size={64} className="opacity-20" />
                                    <p>Tu carrito está vacío.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-purple-600 font-bold hover:underline"
                                    >
                                        Ir al catálogo
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.itemKey} className="flex gap-4 bg-white p-3 rounded-xl border shadow-sm">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={item.imageUrl || "/logo-nicky-transparent.png"}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {item.size ? `Tamaño: ${item.size}` : "Unidad"}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1 border">
                                                    <button
                                                        onClick={() => updateQuantity(item.itemKey, -1)}
                                                        className="text-gray-500 hover:text-purple-700 text-xs p-1"
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.itemKey, 1)}
                                                        className="text-gray-500 hover:text-purple-700 text-xs p-1"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800">${(item.price * item.quantity).toLocaleString()}</p>
                                                    <button
                                                        onClick={() => removeFromCart(item.itemKey)}
                                                        className="text-red-400 text-xs hover:text-red-600 underline"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600 font-medium">Total Estimado</span>
                                    <span className="text-2xl font-bold text-purple-700">${cartTotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-purple-700 transition transform hover:scale-[1.02]"
                                >
                                    ¡Lo quiero todo! ❤️
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    Coordinaremos el pago y envío por WhatsApp.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default CartSidebar;

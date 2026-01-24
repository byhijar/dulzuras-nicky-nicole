import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function CartWidget() {
    const { cartCount, toggleCart } = useCart();

    return (
        <button
            onClick={toggleCart}
            className="relative p-2 text-gray-600 hover:text-purple-600 transition group"
            aria-label="Ver carrito"
        >
            <FaShoppingCart size={24} className="group-hover:scale-110 transition-transform" />

            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white"
                    >
                        {cartCount}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}

export default CartWidget;

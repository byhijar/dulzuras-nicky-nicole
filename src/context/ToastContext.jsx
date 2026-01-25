import { createContext, useContext, useState, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info") => {
        const id = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ message, type, onClose }) {
    const styles = {
        success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: <FaCheckCircle className="text-green-500" /> },
        error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: <FaExclamationCircle className="text-red-500" /> },
        info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: <FaInfoCircle className="text-blue-500" /> },
    };

    const style = styles[type] || styles.info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${style.bg} ${style.border} min-w-[300px] max-w-sm`}
        >
            <div className="text-lg">{style.icon}</div>
            <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
                <FaTimes />
            </button>
        </motion.div>
    );
}

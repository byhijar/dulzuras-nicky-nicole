import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { FaTimes, FaShoppingCart } from "react-icons/fa";

function TortaModal({ torta, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!torta) return null;

  const nombreTorta = torta.nombre || "Producto";

  const handleAddToCart = () => {
    if (torta.sizes && !selectedSize) {
      alert("Por favor selecciona un tamaño.");
      return;
    }
    addToCart(torta, 1, selectedSize);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen Full Width */}
        <div className="relative h-64 bg-gray-100">
          {torta.imagen ? (
            <img
              src={torta.imagen}
              alt={nombreTorta}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🍰</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 text-gray-800 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">{nombreTorta}</h2>
            <p className="text-gray-600 text-sm italic">{torta.descripcion}</p>
          </div>

          {/* Size Selection */}
          {torta.sizes ? (
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Selecciona Opción</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(torta.sizes).map(([size, price]) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded-xl p-3 text-left transition ${selectedSize === size ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" : "hover:bg-gray-50 border-gray-200"}`}
                  >
                    <span className="block text-xs font-semibold text-gray-500 uppercase">{size}</span>
                    <span className="block font-bold text-gray-900 text-lg">${price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-3xl font-bold text-purple-700">${torta.precio?.toLocaleString()}</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={torta.stock <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 ${torta.stock <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-200"
              }`}
          >
            {torta.stock <= 0 ? (
              "Agotado"
            ) : (
              <>
                <FaShoppingCart /> Agregar al Carrito
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TortaModal;

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { FaTimes, FaShoppingCart, FaInfoCircle } from "react-icons/fa";

function TortaModal({ torta, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");

  // Initialize active image when torta opens
  useEffect(() => {
    if (torta) {
      setActiveImage(torta.imageUrl || torta.imagen || "");
    }
  }, [torta]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!torta) return null;

  const nombreTorta = torta.name || torta.nombre || "Producto";

  // Gallery Logic: Use 'images' array if valid, otherwise fallback to single 'imageUrl' or legacy 'imagen'
  const mainImage = torta.imageUrl || torta.imagen;
  const gallery = (torta.images && torta.images.length > 0)
    ? [mainImage, ...torta.images]
    : [mainImage];

  // Filter out empty or nulls and remove duplicates
  const uniqueGallery = [...new Set(gallery.filter(Boolean))];

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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white rounded-full p-2 text-gray-800 transition shadow-sm md:hidden"
        >
          <FaTimes />
        </button>

        {/* COL 1: Gallery (Left) */}
        <div className="md:w-1/2 bg-gray-50 flex flex-col">
          {/* Main Image */}
          <div className="relative flex-1 h-64 md:h-auto overflow-hidden flex items-center justify-center bg-gray-100">
            {activeImage ? (
              <img
                src={activeImage}
                alt={nombreTorta}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">🍰</span>
            )}
          </div>

          {/* Thumbnails (Only show if > 1 image) */}
          {uniqueGallery.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto custom-scrollbar bg-white border-t border-gray-100">
              {uniqueGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${activeImage === img ? "border-purple-600 ring-2 ring-purple-100" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COL 2: Info & Actions (Right) */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded">
                {(torta.category || "Pastelería").toUpperCase()}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mt-2 mb-1">{nombreTorta}</h2>
            </div>
            <button
              onClick={onClose}
              className="hidden md:block text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="mb-6 space-y-3">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {torta.description || torta.descripcion || "Una deliciosa creación de Nicky Nicole, hecha con los mejores ingredientes."}
            </p>

            {/* Ingredients / Filling Extra Info */}
            {(torta.filling || torta.relleno || torta.ingredients || torta.ingredientes) && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800 flex gap-2 items-start mt-2">
                <FaInfoCircle className="mt-0.5 shrink-0" />
                <div>
                  {(torta.filling || torta.relleno) && <p><strong>Relleno:</strong> {torta.filling || torta.relleno}</p>}
                  {(torta.ingredients || torta.ingredientes) && <p><strong>Ingredientes:</strong> {torta.ingredients || torta.ingredientes}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto">
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Precio</label>
                <p className="text-3xl font-bold text-purple-700">${(torta.price || torta.precio)?.toLocaleString()}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleAddToCart}
              disabled={torta.stock <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-[0.99] ${torta.stock <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-200"
                }`}
            >
              {torta.stock <= 0 ? (
                "Agotado"
              ) : (
                <>
                  <FaShoppingCart /> {torta.sizes ? "Agregar Pedido" : "Agregar al Carrito"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TortaModal;

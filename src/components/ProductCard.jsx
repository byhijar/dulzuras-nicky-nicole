import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { FaImages } from "react-icons/fa"; // New icon

function ProductCard({
    product,
    onCardClick,
    ctaHref,
    ctaLabel,
    ctaColor = "purple"
}) {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const {
        name,
        imageUrl,
        images, // Destructure images
        description,
        filling,
        ingredients,
        price,
        sizes
    } = product;

    // Price Logic
    const priceDisplay = sizes
        ? `Desde: $${Math.min(...Object.values(sizes).map(Number))}`
        : (price != null)
            ? `Precio: $${price}`
            : null;

    // ... existing logic ...

    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(product);
        } else if (ctaHref) {
            navigate(ctaHref);
        }
    };

    const btnColorClass =
        ctaColor === "green"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-purple-600 hover:bg-purple-700";

    return (
        <motion.div
            // ... props
            onClick={handleCardClick}
            className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col justify-between h-full cursor-pointer group`}
        >
            <div>
                <div className={`w-full h-48 rounded-lg mb-4 overflow-hidden relative flex items-center justify-center ${!imageUrl ? 'bg-purple-50' : ''}`}>
                    {/* Photo Badge */}
                    {images && images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm z-10">
                            <FaImages /> +{images.length - 1}
                        </div>
                    )}

                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            // ... props
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" // Added subtle zoom
                        />
                    ) : (
                        // ... fallback
                        <img
                            src="/logo-nicky-transparent.png"
                            alt={name}
                            className="w-full h-full object-contain opacity-50 p-4"
                        />
                    )}


                </div>

                <h3 className="text-xl font-bold text-purple-700 mb-1">{name}</h3>

                {filling && (
                    <p className="text-sm text-gray-600 italic mb-1">{filling}</p>
                )}
                {ingredients && (
                    <p className="text-sm text-gray-600 italic mb-1">{ingredients}</p>
                )}
                {description && (
                    <p className="text-sm text-gray-500 mb-2">{description}</p>
                )}
            </div>

            <div className="mt-auto">
                {priceDisplay && (
                    <p className="text-sm font-semibold text-gray-800">{priceDisplay}</p>
                )}

                {(product.stock !== undefined && product.stock <= 0) ? (
                    <button
                        disabled
                        className="mt-4 block w-full text-center py-2 rounded text-white font-semibold bg-gray-400 cursor-not-allowed"
                    >
                        Agotado
                    </button>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();

                            // 0. If href provided, navigate there
                            if (ctaHref) {
                                navigate(ctaHref);
                                return;
                            }

                            // 1. If we have a modal handler, prefer using it (especially for items with options)
                            if (onCardClick) {
                                onCardClick(product);
                                return;
                            }

                            // 2. Direct Add (Fallback if no modal handler passed)
                            if (product.sizes) {
                                // If it needs size but no handler is passed, we can't easily add.
                                // Fallback logic: Try to find a way to customize?
                                // For now, if no ctaHref and no onCardClick, alert is still the fail-safe
                                alert("Este producto requiere seleccionar opciones. Por favor visualízalo en el catálogo.");
                            } else {
                                // Direct Add for simple products
                                addToCart(product, 1);
                            }
                        }}
                        className={`mt-4 w-full block text-center py-2 rounded text-white font-semibold transition flex items-center justify-center gap-2 ${btnColorClass}`}
                    >
                        {ctaLabel || (product.sizes ? "Ver Opciones" : "Agregar")}
                    </button>
                )}
            </div>
        </motion.div >
    );
}

export default ProductCard;

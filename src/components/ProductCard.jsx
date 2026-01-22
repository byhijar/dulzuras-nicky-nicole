import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function ProductCard({
    product,
    onCardClick,
    ctaHref,
    ctaLabel,
    ctaColor = "purple"
}) {
    const {
        name,
        imageUrl,
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

    const handleCardClick = () => {
        if (onCardClick) onCardClick(product);
    };

    const handleCtaClick = (e) => {
        e.stopPropagation();
    };

    const btnColorClass =
        ctaColor === "green"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-purple-600 hover:bg-purple-700";

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleCardClick}
            className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col justify-between h-full ${onCardClick ? "cursor-pointer" : ""}`}
        >
            <div>
                <div className={`w-full h-48 rounded-lg mb-4 overflow-hidden relative flex items-center justify-center ${!imageUrl ? 'bg-purple-50' : ''}`}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/logo-nicky-transparent.png";
                                e.target.className = "w-full h-full object-contain opacity-50 p-4";
                                e.target.parentElement.classList.add("bg-purple-50");
                            }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
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

                <Link
                    to={ctaHref}
                    onClick={handleCtaClick}
                    className={`mt-4 block text-center py-2 rounded text-white font-semibold transition ${btnColorClass}`}
                >
                    {ctaLabel}
                </Link>
            </div>
        </motion.div>
    );
}

export default ProductCard;

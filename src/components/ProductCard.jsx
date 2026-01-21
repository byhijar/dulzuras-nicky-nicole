import { Link } from "react-router-dom";

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
        <div
            onClick={handleCardClick}
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col justify-between h-full ${onCardClick ? "cursor-pointer" : ""}`}
        >
            <div>
                <img
                    src={imageUrl || "/assets/default.jpg"}
                    alt={name}
                    onError={(e) => {
                        e.target.src = "/assets/default.jpg";
                    }}
                    className="h-48 w-full object-contain md:object-cover rounded mb-4"
                />

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
        </div>
    );
}

export default ProductCard;

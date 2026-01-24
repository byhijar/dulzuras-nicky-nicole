import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Load from local storage on init
        try {
            const storedCart = localStorage.getItem("dulzuras_cart");
            return storedCart ? JSON.parse(storedCart) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persist to local storage whenever cart changes
    useEffect(() => {
        localStorage.setItem("dulzuras_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1, size = null) => {
        setCart((prevCart) => {
            // Create a unique ID for the item based on product ID and size
            const itemKey = size ? `${product.id}-${size}` : product.id;

            const existingItemIndex = prevCart.findIndex(
                (item) => (size ? (item.id === product.id && item.size === size) : item.id === product.id)
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const newCart = [...prevCart];
                // Validate against stock if available in product object
                const currentQty = newCart[existingItemIndex].quantity;
                const maxStock = product.stock || 999;

                if (currentQty + quantity > maxStock) {
                    alert(`Solo hay ${maxStock} unidades disponibles de este producto.`);
                    return prevCart;
                }

                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                // New item
                if (quantity > (product.stock || 999)) {
                    alert(`Solo hay ${product.stock} unidades disponibles.`);
                    return prevCart;
                }

                return [...prevCart, {
                    ...product,
                    quantity,
                    size,
                    // Calculate effective price based on size if applicable
                    price: size && product.sizes ? product.sizes[size] : product.price,
                    itemKey // Helper for keys
                }];
            }
        });
        setIsCartOpen(true); // Auto open cart
    };

    const removeFromCart = (itemKey) => {
        setCart((prevCart) => prevCart.filter((item) => item.itemKey !== itemKey));
    };

    const updateQuantity = (itemKey, delta) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.itemKey === itemKey) {
                const newQty = item.quantity + delta;
                // Check limits
                if (newQty < 1) return item;
                if (item.stock && newQty > item.stock) {
                    alert(`Solo hay ${item.stock} unidades disponibles.`);
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    }

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                setIsCartOpen,
                toggleCart,
                cartTotal,
                cartCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

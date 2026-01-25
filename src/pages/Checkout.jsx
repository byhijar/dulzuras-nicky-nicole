import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { createOrder } from "../services/orderService";
import PedidoExitosoModal from "../components/PedidoExitosoModal";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import PageTransition from "../components/PageTransition";

const SERVICE_ID = "service_7qv5o0s";
const TEMPLATE_ID = "template_e57l7h9";
const PUBLIC_KEY = "7NppPVTz-0ZFnPS_6";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfCRFYrAAAAAFlcy9-GPenmLM54R_mI1QTzaDmX";

function Checkout() {
    const navigate = useNavigate();
    const auth = getAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const { addToast } = useToast();

    // State for user data fetching
    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                // Pre-fill email immediately
                setCorreo(user.email || "");
                setNombre(user.displayName || "");

                // Try to fetch extended profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.fullName && !user.displayName) setNombre(userData.fullName);
                        if (userData.phone) setTelefono(userData.phone);
                        // If user typed name manually before, don't overwrite unless empty, but logic here is simple: prefill on load.
                        if (userData.fullName) setNombre(userData.fullName);
                    }
                } catch (err) {
                    console.log("No built-in profile found, using auth defaults");
                }
            }
        };
        fetchUserData();
    }, [auth]);

    const [mostrarModal, setMostrarModal] = useState(false);
    const recaptchaRef = useRef(null);

    // Form State
    const [fechaEntrega, setFechaEntrega] = useState("");
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");

    const hoy = new Date();
    const fechaMinima = new Date(hoy);
    fechaMinima.setDate(hoy.getDate() + 7);
    const fechaMinimaStr = fechaMinima.toISOString().split("T")[0];

    // Totals
    const abono = cartTotal / 2;

    const validarCampos = () => {
        if (cart.length === 0) {
            addToast("Tu carrito está vacío.", "error");
            return false;
        }
        if (!fechaEntrega || !nombre || !correo || !telefono) {
            addToast("Por favor completa todos los campos de contacto y entrega.", "error");
            return false;
        }
        return true;
    };

    const guardarPedido = async () => {
        try {
            const orderData = {
                items: cart,
                total: cartTotal,
                abono,
                fechaEstimada: fechaEntrega,
                cliente: { nombre, correo, telefono },
                isCartOrder: true,
                status: "pendiente",
                createdAt: new Date()
            };

            if (auth.currentUser) {
                orderData.userId = auth.currentUser.uid;
                orderData.userEmail = auth.currentUser.email;
            }

            await createOrder(orderData);
            console.log("✅ Pedido guardado en Firebase");
            clearCart();
            return true;
        } catch (error) {
            console.error("Error guardando pedido en DB:", error);
            addToast("Error al guardar pedido. Intenta nuevamente.", "error");
            throw error;
        }
    };

    const enviarCorreo = async () => {
        if (!validarCampos()) return;

        let token = "";
        try {
            token = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
        } catch (captchaError) {
            console.error("Captcha Error:", captchaError);
            addToast("Error de verificación (Captcha). Revisa tu conexión o llaves.", "error");
            return;
        }

        try {
            // 1. Guardar en DB primero
            await guardarPedido();

            // 2. Si guarda OK, enviar correo
            const templateParams = {
                from_name: nombre,
                reply_to: correo,
                telefono,
                producto: "PEDIDO CARRITO WEB",
                detalle_pedido: cart.map(i => `${i.quantity}x ${i.name} (${i.size || 'Unidad'})`).join('\n'),
                fechaEntrega,
                precio: cartTotal,
                abono,
                "g-recaptcha-response": token
            };

            emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
                .then(() => {
                    setMostrarModal(true);
                })
                .catch((err) => {
                    console.error("❌ Error al enviar el correo:", err);
                    // Si falla el correo pero guardó en DB, igual mostramos éxito pero avisamos
                    setMostrarModal(true);
                });
        } catch (error) {
            console.error("Proceso cancelado por error en guardado.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        enviarCorreo();
    };

    if (cart.length === 0 && !mostrarModal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="text-purple-200 mb-4">
                    <FaShoppingCart size={64} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-600 mb-6">Parece que aún no has elegido nada delicioso.</p>
                <button
                    onClick={() => navigate('/catalogo')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition"
                >
                    Ir al Catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

                {/* Left Column: Order Summary (Items) */}
                <div className="md:col-span-1 space-y-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-2">
                        <FaArrowLeft /> Volver
                    </button>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-50">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaShoppingCart className="text-purple-500" /> Resumen
                        </h2>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                    <img
                                        src={item.imageUrl || "/logo-nicky-transparent.png"}
                                        className="w-12 h-12 rounded bg-gray-100 object-cover"
                                        alt={item.name}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.size || "Unidad"} x {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-purple-700">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-dashed">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Total</span>
                                <span className="text-2xl font-bold text-purple-800">${cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm bg-purple-50 p-2 rounded text-purple-700">
                                <span>Abono requerido (50%)</span>
                                <span className="font-bold">${abono.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Checkout Form */}
                <div className="md:col-span-2">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Finalizar Compra</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Delivery Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Entrega Estimada</label>
                                <input
                                    type="date"
                                    min={fechaMinimaStr}
                                    value={fechaEntrega}
                                    onChange={(e) => setFechaEntrega(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 outline-none border transition"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    ℹ️ Sujeto a disponibilidad. Te confirmaremos por WhatsApp.
                                </p>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Contact Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-700 mb-4">Datos de Contacto</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 outline-none border mt-1"
                                            placeholder="Ej. Juan Pérez"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Teléfono (WhatsApp)</label>
                                        <input
                                            type="tel"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 outline-none border mt-1"
                                            placeholder="+569..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            value={correo}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 outline-none border mt-1"
                                            placeholder="ejemplo@correo.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center my-4">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={RECAPTCHA_SITE_KEY}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.01]"
                            >
                                Confirmar Pedido 🛍️
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                Al confirmar, te contactaremos para coordinar el pago del 50% de abono.
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {mostrarModal && (
                <PedidoExitosoModal onClose={() => {
                    setMostrarModal(false);
                    navigate("/");
                }} />
            )}
        </div>
    );
}

export default Checkout;

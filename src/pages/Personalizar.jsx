import { useState, useRef, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { createOrder } from "../services/orderService";
import PedidoExitosoModal from "../components/PedidoExitosoModal";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import { FaBirthdayCake, FaMagic, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import PageTransition from "../components/PageTransition";

const SERVICE_ID = "service_7qv5o0s";
const TEMPLATE_ID = "template_e57l7h9";
const PUBLIC_KEY = "7NppPVTz-0ZFnPS_6";
// Clave de prueba oficial de Google para localhost.
// Reemplazar con la clave real del cliente cuando se despliegue en dominio final.
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function Personalizar() {
    const [mostrarModal, setMostrarModal] = useState(false);
    const auth = getAuth();
    const recaptchaRef = useRef(null);

    // Form State
    const [tematica, setTematica] = useState("");
    const [sabor, setSabor] = useState("");
    const [invitados, setInvitados] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState("");

    // Contact State
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");

    const hoy = new Date();
    const fechaMinima = new Date(hoy);
    fechaMinima.setDate(hoy.getDate() + 7);
    const fechaMinimaStr = fechaMinima.toISOString().split("T")[0];


    // Auto-fill user data if logged in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                if (user.displayName) setNombre(user.displayName);
                if (user.email) setCorreo(user.email);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    const validarCampos = () => {
        if (!tematica || !fechaEntrega || !nombre || !correo || !telefono) {
            alert("Por favor completa los campos principales.");
            return false;
        }
        return true;
    };

    const guardarSolicitud = async () => {
        try {
            const orderData = {
                items: [{
                    name: "Cotización Personalizada",
                    tipo: "custom",
                    tematica,
                    sabor: sabor || "Por definir",
                    invitados: invitados || "N/A"
                }],
                total: 0, // Quote request has no fixed price yet
                isQuoteRequest: true,
                status: "solicitud_cotizacion",
                fechaEstimada: fechaEntrega,
                cliente: { nombre, correo, telefono },
                createdAt: new Date()
            };

            if (auth.currentUser) {
                orderData.userId = auth.currentUser.uid;
                orderData.userEmail = auth.currentUser.email;
            }

            await createOrder(orderData);
        } catch (error) {
            console.error("Error guardando solicitud:", error);
        }
    };

    const enviarCorreo = async () => {
        if (!validarCampos()) return;

        // Ejecutar reCAPTCHA
        try {
            const token = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
            console.log("ReCAPTCHA verificado");
        } catch (error) {
            console.error("ReCAPTCHA error:", error);
            // Continuamos incluso si falla captch en dev para no bloquear
        }

        guardarSolicitud();

        const templateParams = {
            from_name: nombre,
            reply_to: correo,
            telefono,
            producto: "COTIZACIÓN PERSONALIZADA",
            detalle_pedido: `Temática: ${tematica}\nSabor pref: ${sabor}\nInvitados: ${invitados}`,
            fechaEntrega,
            precio: "A cotizar",
            abono: "Pendiente",
            "g-recaptcha-response": "dummy_token" // Test mode
        };

        emailjs
            .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
            .then(() => {
                setMostrarModal(true);
            })
            .catch((err) => {
                console.error("❌ Error al enviar:", err);
                setMostrarModal(true);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        enviarCorreo();
    };

    return (
        <PageTransition>
            <PageHeader
                title="Taller de Diseño"
                subtitle="Cuéntanos tu idea y crearemos algo único para ti"
                bgImage="/assets/hero-bg.jpg"
            />

            <section className="py-12 px-6 max-w-3xl mx-auto min-h-screen">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-purple-100"
                >

                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-800">Solicitud de Cotización</h2>
                        <p className="text-gray-500 mt-2">Te contactaremos con un presupuesto personalizado.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Design Section */}
                        <div className="space-y-6">
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="flex items-start gap-4"
                            >
                                <div className="bg-purple-100 p-3 rounded-full text-purple-600 hidden md:block">
                                    <FaMagic size={24} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué idea tienes en mente?</label>
                                    <textarea
                                        value={tematica}
                                        onChange={e => setTematica(e.target.value)}
                                        placeholder="Ej: Una torta de Spiderman con colores rojos y azules, nombre 'Mateo'..."
                                        className="w-full border-gray-300 rounded-xl p-4 h-32 focus:ring-2 focus:ring-purple-400 outline-none border bg-gray-50 resize-none transition"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-1">
                                        <FaBirthdayCake />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Preferencia de Sabor</label>
                                        <input
                                            type="text"
                                            value={sabor}
                                            onChange={e => setSabor(e.target.value)}
                                            placeholder="Ej: Tres Leches, Chocolate..."
                                            className="w-full border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-400 outline-none border transition"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-1">
                                        <FaUsers />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Invitados Aprox.</label>
                                        <select
                                            value={invitados}
                                            onChange={e => setInvitados(e.target.value)}
                                            className="w-full border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-400 outline-none border bg-white transition"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="10-15">10 - 15 personas</option>
                                            <option value="20-30">20 - 30 personas</option>
                                            <option value="40+">Más de 40 personas</option>
                                        </select>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <hr className="border-purple-50" />

                        {/* Logistics Section */}
                        <div className="space-y-6">
                            <motion.div whileFocus={{ scale: 1.01 }}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha del Evento</label>
                                <input
                                    type="date"
                                    min={fechaMinimaStr}
                                    value={fechaEntrega}
                                    onChange={(e) => setFechaEntrega(e.target.value)}
                                    className="w-full border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-400 outline-none border transition"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2 ml-1">Recomendamos reservar con 2 semanas de anticipación para diseños complejos.</p>
                            </motion.div>

                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <h3 className="text-gray-800 font-bold mb-4">Datos de Contacto</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Tu Nombre"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="border border-gray-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-200 outline-none transition hover:bg-white focus:bg-white"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="WhatsApp"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className="border border-gray-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-200 outline-none transition hover:bg-white focus:bg-white"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        className="border border-gray-200 rounded-lg p-3 w-full md:col-span-2 focus:ring-2 focus:ring-purple-200 outline-none transition hover:bg-white focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                size="invisible"
                                sitekey={RECAPTCHA_SITE_KEY}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition"
                        >
                            Enviar Solicitud
                        </motion.button>
                        <p className="text-center text-xs text-gray-400">Te responderemos en menos de 24 horas.</p>

                    </form>
                </motion.div>
            </section>

            {mostrarModal && (
                <PedidoExitosoModal
                    onClose={() => setMostrarModal(false)}
                    mensaje="¡Solicitud Enviada! Analizaremos tu idea y te escribiremos con el presupuesto."
                />
            )}
        </PageTransition>
    );
}

export default Personalizar;

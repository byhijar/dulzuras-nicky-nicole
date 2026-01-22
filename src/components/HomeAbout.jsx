import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHeart, FaCalendarCheck, FaTruck } from "react-icons/fa";

function HomeAbout() {
    return (
        <section className="py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                {/* Text Column */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-6">
                        Hechas con amor, <br />
                        <span className="text-purple-500">personalizadas a tu estilo</span>
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        En Dulzuras de Nicky Nicole, cada preparación es única. No usamos pre-mezclas industriales; aquí batimos huevos, horneamos bizcochos caseros y preparamos rellenos generosos para que celebres con el sabor de verdad.
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <FaHeart className="text-purple-500 mt-1 shrink-0" />
                            <span className="text-gray-700">Ingredientes frescos y de primera calidad.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <FaCalendarCheck className="text-purple-500 mt-1 shrink-0" />
                            <span className="text-gray-700">Reserva con anticipación (cupos limitados).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <FaTruck className="text-purple-500 mt-1 shrink-0" />
                            <span className="text-gray-700">Retiro en Puente Alto o despacho a coordinar.</span>
                        </li>
                    </ul>

                    <Link
                        to="/formulario"
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1"
                    >
                        Cotizar mi Pedido
                    </Link>
                </motion.div>

                {/* Image Column */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Main Image Container with quirky border radius */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img
                            src="/logo-nicky-transparent.png"
                            alt="Sobre Dulzuras Nicky Nicole"
                            className="w-full h-auto object-cover bg-purple-50"
                        />
                    </div>

                    {/* Decorative background circle */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-50 rounded-full blur-3xl opacity-60"></div>
                </motion.div>
            </div>
        </section>
    );
}

export default HomeAbout;

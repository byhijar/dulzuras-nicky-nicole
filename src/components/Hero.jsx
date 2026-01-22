import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Hero() {
    return (
        <section className="relative w-full h-[600px] bg-black overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: "url('/assets/tortas/choco-manjar-frutilla.jpg')" }} // Using an existing accessible image
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-purple-900/90"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center px-6">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                        Dulzuras de <span className="text-purple-400">Nicky Nicole</span>
                    </h1>
                </motion.div>

                <motion.p
                    className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl drop-shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Tortas personalizadas, vasos y alfajores hechos con amor en Puente Alto.
                    <br className="hidden md:block" /> ¡Endulza tus mejores momentos! 🍓✨
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link
                        to="/catalogo/torta"
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-purple-500/50 transition transform hover:-translate-y-1"
                    >
                        Ver Catálogo
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}

export default Hero;

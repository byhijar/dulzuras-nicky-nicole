import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

const testimonials = [
    {
        id: 1,
        name: "Carolina Méndez",
        text: "¡La torta de lúcuma manjar estaba exquisita! A todos mis invitados les encantó. La presentación impecable.",
        rating: 5,
    },
    {
        id: 2,
        name: "Felipe Soto",
        text: "Pedí alfajores para un regalo y quedaron fascinados. Muy buena atención y puntualidad en la entrega.",
        rating: 5,
    },
    {
        id: 3,
        name: "Andrea Riquelme",
        text: "Las tortas en vaso son mi debilidad. El tamaño perfecto y el sabor casero es inigualable. ¡Recomendadísimo!",
        rating: 5,
    },
];

function Testimonials() {
    return (
        <section className="py-16 bg-gradient-to-b from-white to-purple-50">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
                        Lo que dicen nuestros clientes ❤️
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        La felicidad de quienes confían en nosotros es nuestro ingrediente secreto.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(t.rating)].map((_, index) => (
                                    <FaStar key={index} />
                                ))}
                            </div>
                            <p className="text-gray-600 italic mb-6">"{t.text}"</p>
                            <div className="font-bold text-purple-700">- {t.name}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Testimonials;

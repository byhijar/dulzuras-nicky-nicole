import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { FaWhatsapp, FaInstagram, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import PageTransition from "../components/PageTransition";

function Contacto() {
  return (
    <PageTransition>
      <PageHeader
        title="Contáctanos"
        subtitle="Estamos listos para endulzar tu evento"
        bgImage="/assets/contact-bg.jpg"
      />

      <section className="py-20 px-6 max-w-5xl mx-auto">
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Contact Info Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100">
            <h3 className="text-2xl font-bold text-purple-800 mb-6">Información de Contacto</h3>
            <div className="space-y-6">
              <a href="https://wa.me/56974062743" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition border border-transparent hover:border-purple-100">
                <div className="bg-green-100 p-3 rounded-full text-green-600 text-2xl">
                  <FaWhatsapp />
                </div>
                <div>
                  <p className="font-bold text-gray-800">WhatsApp</p>
                  <p className="text-gray-600">+56 9 7406 2743</p>
                </div>
              </a>

              <a href="https://instagram.com/_dulzuras.nickynicole" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition border border-transparent hover:border-purple-100">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600 text-2xl">
                  <FaInstagram />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Instagram</p>
                  <p className="text-gray-600">@_dulzuras.nickynicole</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-2xl">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Email</p>
                  <p className="text-gray-600">dulzuras.nickynicole@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map / Location Card */}
          <div className="bg-purple-900 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-center">
            <FaMapMarkerAlt className="text-6xl text-purple-300 mb-6 mx-auto" />
            <h3 className="text-2xl font-bold text-center mb-4">Ubicación</h3>
            <p className="text-center text-purple-100 text-lg mb-8">
              Realizamos entregas en <strong>Puente Alto</strong> y comunas aledañas.
              <br />
              También puedes retirar tu pedido previamente coordinado.
            </p>
            <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur-sm">
              <p className="font-bold">Horario de Atención</p>
              <p className="text-sm">Lunes a Sábado: 10:00 - 18:00 hrs</p>
            </div>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
}

export default Contacto;

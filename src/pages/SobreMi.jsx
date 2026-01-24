import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import PageTransition from "../components/PageTransition";

function SobreMi() {
  return (
    <PageTransition>
      <PageHeader
        title="Sobre Mí"
        subtitle="Conoce la historia detrás de Dulzuras"
        bgImage="/assets/about-bg.jpg"
      />

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">

        {/* Profile Photo (from public/assets/nicky1.jpg) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 relative inline-block"
        >
          <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50"></div>
          <img
            src="/assets/nicky1.jpg"
            alt="Nicky Nicole"
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-white shadow-2xl relative z-10 mx-auto"
          />
        </motion.div>

        {/* Story Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-gray-700 text-lg leading-relaxed mb-16"
        >
          <p>
            Hola, soy <strong className="text-purple-700">Nicky Nicole</strong>, pastelera independiente desde el 2021 y creadora de <em>Dulzuras de Nicky Nicole</em>.
            Comencé este hermoso camino atendiendo a un grupo de adultos mayores que necesitaban servicios de repostería... y desde entonces no he parado.
          </p>

          <p>
            Cada pastel que realizo está inspirado en la personalidad de quien lo recibe. Me encanta dejar un sello único en cada creación,
            y disfruto especialmente los desafíos creativos que me permiten innovar.
          </p>

          <p className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-400 italic text-purple-900">
            "Mi primer encargo importante fue una torta de dos pisos con temática neón... ¡y desde ahí supe que esto era lo mío!"
          </p>

          <p>
            En cada pedido encontrarás <strong>dedicación, amor</strong> y, sobre todo, <strong>responsabilidad</strong>.
            Amo lo que hago y me esfuerzo por que cada dulce detalle cuente.
          </p>

          <h3 className="text-2xl font-handwriting text-purple-600 mt-8">
            "Cada pastel lleva una parte de mi corazón 💜"
          </h3>
        </motion.div>

        {/* Gallery: Mis Comienzos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-purple-800 mb-2">Mis comienzos</h2>
          <p className="text-gray-500 mb-10">
            Estas tortas marcaron el inicio de mi camino como pastelera. Cada una tiene su historia, su aprendizaje y mucho cariño. 🍰💜
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Torta Neón */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-purple-100"
            >
              <img src="/assets/inspiraciones/torta-neon.jpg" alt="Torta Neón" className="w-full h-80 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-purple-700 mb-2">Torta Neón ✨</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  La primera torta de dos pisos que hice para el cumpleaños de mi cuñada.
                  Me desafió... y me enseñó que podía lograr lo que soñaba.
                </p>
              </div>
            </motion.div>

            {/* Torta Harry Potter */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-purple-100"
            >
              <img src="/assets/inspiraciones/torta-harry.jpg" alt="Torta Harry Potter" className="w-full h-80 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-purple-700 mb-2">Torta temática Harry Potter 🧙‍♂️</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Un encargo especial para una amiga fan de Harry Potter.
                  Personalizada con cariño, estilo y mucha magia ✨
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </section>
    </PageTransition>
  );
}

export default SobreMi;

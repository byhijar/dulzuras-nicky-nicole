import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "./components/ProductCard";
import Hero from "./components/Hero";
import HomeAbout from "./components/HomeAbout";
import Testimonials from "./components/Testimonials";
import TortaModal from "./components/TortaModal";
import { getFeaturedProducts } from "./services/productService";

function App() {
  const [tortaSeleccionada, setTortaSeleccionada] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedProducts(3);
        setFeaturedProducts(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar destacados");
      } finally {
        setLoading(false);
      }
    };
    fetchDestacados();
  }, []);

  // Helpers to map singular type
  const getSingularType = (category) => {
    const map = {
      tortas: "torta",
      vasos: "vaso",
      alfajores: "alfajor"
    };
    return map[category] || "torta";
  };

  return (
    <>
      <Hero />

      {/* Featured Products */}
      <motion.section
        className="py-16 px-6 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
            Favoritos del Mes 🍰
          </h2>
          <p className="text-gray-600">Lo más pedido por nuestros clientes.</p>
        </div>

        {loading && <div className="text-center text-purple-600 animate-pulse">Cargando destacados...</div>}

        {!loading && (
          <div className="grid gap-8 md:grid-cols-3">
            {(featuredProducts.length > 0 ? featuredProducts : []).map((prod, i) => {
              const typeSingular = getSingularType(prod.category);

              return (
                <div key={prod.id || i}>
                  <ProductCard
                    product={{ ...prod, imageUrl: prod.imageUrl }}
                    onCardClick={(p) => setTortaSeleccionada({
                      ...p,
                      nombre: p.name,
                      descripcion: p.description,
                      imagen: p.imageUrl,
                      precio: p.price
                    })}
                    ctaHref={`/formulario?tipo=${typeSingular}&producto=${encodeURIComponent(prod.name)}`}
                    ctaLabel={typeSingular === "torta" ? "Personalizar" : "Encargar"}
                    ctaColor={typeSingular === "torta" ? "purple" : "green"}
                  />
                </div>
              );
            })}

            {/* Fallback if no products (Error or empty) */}
            {!loading && featuredProducts.length === 0 && (
              <div className="col-span-3 text-center text-gray-500 italic">
                Pronto nuevas sorpresas...
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* Social Proof & About */}
      <HomeAbout />
      <Testimonials />

      <TortaModal torta={tortaSeleccionada} onClose={() => setTortaSeleccionada(null)} />
    </>
  );
}

export default App;

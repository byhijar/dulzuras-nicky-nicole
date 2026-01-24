import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import PageHeader from "../components/PageHeader";
import PageTransition from "../components/PageTransition";
import { getProducts } from "../services/productService";

function Catalogo() {
  const { categoria = "torta" } = useParams();
  const [filtro, setFiltro] = useState("todos");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map URL params (singular) to Firestore categories (plural)
  const categoryMap = {
    torta: "tortas",
    vaso: "vasos",
    alfajor: "alfajores"
  };

  const currentCategory = categoryMap[categoria] || "tortas";

  // Labels for UI
  const categoryLabels = {
    tortas: "Tortas Personalizadas",
    vasos: "Tortas en Vaso",
    alfajores: "Alfajores y Galletas"
  };

  const categoryImages = {
    tortas: "/assets/tortas/selva-negra.jpg",
    vasos: "/assets/vasos/vaso-lucuma.jpg",
    alfajores: "/assets/logo-nicky.png" // Fallback to logo as alfajores folder is missing
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({ category: currentCategory });
        setProducts(data);
      } catch (err) {
        console.error("Error loading catalogue:", err.code, err.message);
        setError(`Error al cargar los productos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // Reset filter when category changes
    setFiltro("todos");
  }, [currentCategory]);

  const filteredProducts = products.filter((p) => {
    if (filtro === "todos") return true;
    return p.flavorTags?.includes(filtro);
  });

  return (
    <PageTransition>
      <PageHeader
        title={categoryLabels[currentCategory]}
        subtitle="Elige tu sabor favorito y personalízalo"
        bgImage={categoryImages[currentCategory]}
      />

      <section className="py-12 px-6 max-w-7xl mx-auto min-h-screen">
        {loading && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-xl text-purple-700 font-semibold animate-pulse">Cargando catálogo...</div>
          </div>
        )}

        {error && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">¡Ups! Algo salió mal</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Filtros de sabor (solo para tortas) */}
            {currentCategory === "tortas" && (
              <div className="mb-8 flex flex-wrap gap-3 justify-center">
                {["todos", "frambuesa", "chocolate", "manjar", "durazno"].map((sabor) => (
                  <button
                    key={sabor}
                    onClick={() => setFiltro(sabor)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition ${filtro === sabor
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                      }`}
                  >
                    {sabor.charAt(0).toUpperCase() + sabor.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Productos Grid with Animation */}
            <motion.div
              className="grid md:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredProducts.map((producto, i) => (
                <motion.div
                  key={producto.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <ProductCard
                    product={producto}
                    ctaHref={`/formulario?tipo=${categoria}&producto=${encodeURIComponent(producto.name)}`}
                    ctaLabel={currentCategory === "tortas" ? "Personalizar" : "Encargar"}
                  />
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">No encontramos productos con esos filtros.</p>
                  <button onClick={() => setFiltro("todos")} className="text-purple-600 font-bold mt-2 hover:underline">
                    Ver todos
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </section>
    </PageTransition>
  );
}

export default Catalogo;

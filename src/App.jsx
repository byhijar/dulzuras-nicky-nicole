import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./components/ProductCard";
import Carrusel from "./components/Carrusel";
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
      <Carrusel />

      <main className="pt-10 px-6 text-center">
        <img
          src="/logo-nicky-transparent.png"
          alt="Logo Dulzuras de Nicky Nicole"
          className="h-32 w-32 object-cover rounded-full border-4 border-purple-300 shadow-lg mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold text-purple-700 mb-2">
          Bienvenidos a Dulzuras de Nicky Nicole
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tortas personalizadas hechas con amor en Puente Alto 🍓✨
          <br /> ¡Reserva con anticipación y endulza tus momentos!
        </p>
      </main>

      <section className="mt-14 px-4 max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
          Tortas destacadas 🍰
        </h2>

        {loading && <div className="text-center text-purple-600 animate-pulse">Cargando destacados...</div>}

        {!loading && (
          <div className="grid gap-6 md:grid-cols-3">
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
      </section>

      <TortaModal torta={tortaSeleccionada} onClose={() => setTortaSeleccionada(null)} />
    </>
  );
}

export default App;

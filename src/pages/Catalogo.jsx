import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({ category: currentCategory });
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los productos.");
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
    // Use flavorTags for robust filtering
    return p.flavorTags?.includes(filtro);
  });

  if (loading) {
    return (
      <div className="mt-32 text-center">
        <div className="text-xl text-purple-700 font-semibold animate-pulse">Cargando catálogo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-32 text-center px-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">¡Ups! Algo salió mal</h2>
        <p className="text-gray-600 mb-4">Catálogo en actualización. Por favor intenta más tarde.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <section className="mt-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
        {categoryLabels[currentCategory]}
      </h2>

      {/* Filtros de sabor (solo para tortas) */}
      {currentCategory === "tortas" && (
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {["todos", "frambuesa", "chocolate", "manjar", "durazno"].map((sabor) => (
            <button
              key={sabor}
              onClick={() => setFiltro(sabor)}
              className={`px-4 py-1.5 rounded-full border text-sm transition ${filtro === sabor
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                }`}
            >
              {sabor.charAt(0).toUpperCase() + sabor.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Productos */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredProducts.map((producto) => (
          <ProductCard
            key={producto.id}
            product={producto}
            ctaHref={`/formulario?tipo=${categoria}&producto=${encodeURIComponent(producto.name)}`}
            ctaLabel={currentCategory === "tortas" ? "Personalizar" : "Encargar"}
          />
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No encontramos productos con esos filtros.
          </div>
        )}
      </div>
    </section>
  );
}

export default Catalogo;

import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { tortasPersonalizadas, tortasVaso, alfajoresYGalletas } from "../data/productos";
import PedidoExitosoModal from "../components/PedidoExitosoModal";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";

const SERVICE_ID = "service_7qv5o0s";
const TEMPLATE_ID = "template_e57l7h9";
const PUBLIC_KEY = "7NppPVTz-0ZFnPS_6";
const RECAPTCHA_SITE_KEY = "6Le5-yYpAAAAACfY7-VXGiEflUPniW4C1OB_N0cW";

function FormularioPedido() {
  const [searchParams] = useSearchParams();
  const [mostrarModal, setMostrarModal] = useState(false);

  const recaptchaRef = useRef(null);

  const tipoInicial = searchParams.get("tipo") || "torta";
  const productoInicial = searchParams.get("producto") || "";

  const [tipo, setTipo] = useState(tipoInicial);
  const [producto, setProducto] = useState(productoInicial);
  const [tamaño, setTamaño] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const hoy = new Date();
  const fechaMinima = new Date(hoy);
  fechaMinima.setDate(hoy.getDate() + 7);
  const fechaMinimaStr = fechaMinima.toISOString().split("T")[0];

  const productos =
    tipo === "torta"
      ? tortasPersonalizadas
      : tipo === "vaso"
        ? tortasVaso
        : alfajoresYGalletas;

  const seleccionado = productos.find((p) => p.nombre === producto);
  const tamañosDisponibles =
    tipo === "torta"
      ? Object.keys(seleccionado?.tamaños || {})
      : tipo === "vaso"
        ? ["unidad"]
        : ["unidad", "pack12"];

  const total =
    tipo === "torta"
      ? seleccionado?.tamaños?.[tamaño] || 0
      : seleccionado?.precio || 0;

  const abono = total / 2;

  const validarCampos = () => {
    if (!producto || (tipo === "torta" && !tamaño) || !fechaEntrega || !nombre || !correo || !telefono) {
      alert("Por favor completa todos los campos antes de continuar.");
      return false;
    }
    return true;
  };

  const guardarPedido = async () => {
    await addDoc(collection(db, "pedidos"), {
      tipo,
      producto,
      tamaño,
      precio: total,
      abono,
      fechaEstimada: fechaEntrega,
      cliente: { nombre, correo, telefono },
      fecha: Timestamp.now()
    });
    console.log("✅ Pedido guardado en Firebase");
  };

  const enviarCorreo = async () => {
    if (!validarCampos()) return;

    const token = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    await guardarPedido();

    const templateParams = {
      from_name: nombre,
      reply_to: correo,
      telefono,
      producto,
      tamaño,
      fechaEntrega,
      precio: total,
      abono,
      "g-recaptcha-response": token
    };

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => alert("✅ Correo enviado correctamente."))
      .catch((err) => {
        console.error("❌ Error al enviar el correo:", err);
        alert("Ocurrió un error al enviar el correo.");
      });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    enviarCorreo();
  };

  return (
    <>
      <div className="relative h-64 w-full bg-purple-900 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Haz tu Pedido</h1>
          <p className="text-lg text-purple-200">Personaliza tu torta o elige tus dulces favoritos</p>
        </div>
      </div>

      <section className="py-12 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-center text-purple-800 mb-8 border-b pb-4">Detalles del Pedido</h2>

          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tipo de Producto */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué deseas pedir?</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setProducto(""); // Resetear producto al cambiar tipo
                    setTamaño("");
                  }}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  <option value="torta">Torta Personalizada</option>
                  <option value="vaso">Torta en Vaso</option>
                  <option value="alfajor">Alfajores y Galletas</option>
                </select>
              </div>

              {/* Producto Específico */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sabor / Modelo</label>
                <select
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  disabled={!tipo}
                >
                  <option value="">Selecciona una opción</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tamaño (Solo si aplica) */}
              {tamañosDisponibles.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tamaño</label>
                  <select
                    value={tamaño}
                    onChange={(e) => setTamaño(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  >
                    <option value="">Selecciona tamaño</option>
                    {tamañosDisponibles.map((t) => (
                      <option key={t} value={t}>
                        {t === "unidad" ? "Unidad" : t === "pack12" ? "Pack x 12" : t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fecha Entrega */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Entrega Estimada</label>
                <input
                  type="date"
                  min={fechaMinimaStr}
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 7 días de anticipación</p>
              </div>
            </div>

            {/* Cliente Info */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tus Datos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono (WhatsApp)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 md:col-span-2"
                  required
                />
              </div>
            </div>

            {/* Resumen Precio */}
            <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center border border-purple-100">
              <div>
                <p className="text-sm text-gray-600">Total Estimado:</p>
                <p className="text-2xl font-bold text-purple-700">${total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Abono (50%):</p>
                <p className="text-xl font-bold text-purple-600">${abono.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey={RECAPTCHA_SITE_KEY}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02]"
            >
              Enviar Pedido y Coordinar Pago
            </button>
          </form>
        </div>
      </section>

      {mostrarModal && (
        <PedidoExitosoModal onClose={() => setMostrarModal(false)} />
      )}
    </>
  );
}

export default FormularioPedido;

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
const RECAPTCHA_SITE_KEY = "6Le5-yYpAAAAACfY7-VXGiEflUPniW4C1OB_N0cW"; // Reemplaza si es necesario

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

  const enviarWhatsApp = async () => {
    if (!validarCampos()) return;
    await guardarPedido();

    const mensaje = `Hola Nicki, soy ${nombre} (${correo} / ${telefono}) y quiero pedir una ${
      tipo === "torta" ? "torta personalizada" : tipo
    }:\n- Producto: ${producto}\n${
      tipo === "torta" ? `- Tamaño: ${tamaño} personas\n` : ""
    }- Precio total: $${total}\n- Abono: $${abono}\n- Fecha estimada de entrega: ${
      fechaEntrega || "por definir"
    }\n\n¿Está disponible para esa fecha? 😊🍰`;

    window.open(`https://wa.me/56974062743?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const enviarDirecto = async () => {
    if (!validarCampos()) return;
    await guardarPedido();
    setMostrarModal(true);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Personaliza tu pedido</h2>
      <p className="text-sm text-red-600 font-medium text-center mb-6">
        🕒 Todos los pedidos deben hacerse con mínimo 7 días de anticipación.
      </p>

      {/* Contacto */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Tu nombre</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-2 border rounded bg-purple-50" />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Correo electrónico</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full p-2 border rounded bg-purple-50" />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Teléfono</label>
        <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full p-2 border rounded bg-purple-50" />
      </div>

      {/* Producto */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Tipo de producto</label>
        <select value={tipo} onChange={(e) => { setTipo(e.target.value); setProducto(""); setTamaño(""); }} className="w-full p-2 border rounded bg-purple-50">
          <option value="torta">Torta personalizada</option>
          <option value="vaso">Torta en vaso</option>
          <option value="alfajor">Alfajor / Galleta</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Elige tu {tipo}</label>
        <select value={producto} onChange={(e) => setProducto(e.target.value)} className="w-full p-2 border rounded bg-purple-50">
          <option value="">-- Seleccionar --</option>
          {productos.map((p, i) => (
            <option key={i} value={p.nombre}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {tipo === "torta" && producto && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Tamaño</label>
          <select value={tamaño} onChange={(e) => setTamaño(e.target.value)} className="w-full p-2 border rounded bg-purple-50">
            <option value="">-- Seleccionar --</option>
            {tamañosDisponibles.map((t, i) => (
              <option key={i} value={t}>{t} personas</option>
            ))}
          </select>
        </div>
      )}

      {producto && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Fecha estimada de entrega</label>
          <input type="date" min={fechaMinimaStr} value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="w-full p-2 border rounded bg-purple-50" />
          <p className="text-xs text-gray-500 mt-1 italic">* Desde el {fechaMinimaStr}</p>
        </div>
      )}

      {producto && seleccionado?.ingredientes && (
        <div className="text-sm text-gray-600 mb-1 italic">Ingredientes: {seleccionado.ingredientes}</div>
      )}
      {producto && seleccionado?.relleno && (
        <div className="text-sm text-gray-600 mb-2 italic">Relleno: {seleccionado.relleno}</div>
      )}

      {producto && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-gray-700">
            Total: <span className="text-purple-700">${total}</span>
          </p>
          <p className="text-sm text-gray-500">
            Abono: <span className="font-medium">${abono}</span> (50%)
          </p>
        </div>
      )}

      {producto && (
        <div className="flex flex-col gap-2">
          <button onClick={enviarWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow">Enviar por WhatsApp</button>
          <button onClick={enviarCorreo} className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded border">¿Prefieres enviar por correo?</button>
          <button onClick={enviarDirecto} className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded border shadow-sm">Enviar directamente desde aquí</button>
        </div>
      )}

      <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />

      {mostrarModal && <PedidoExitosoModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}

export default FormularioPedido;

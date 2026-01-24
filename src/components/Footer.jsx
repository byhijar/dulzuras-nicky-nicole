import {
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaTiktok,
  FaEnvelope
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-purple-100 mt-12 text-center text-sm text-gray-700 py-6 border-t px-4">
      {/* Redes sociales */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <FaInstagram className="text-purple-700" />
          <a
            href="https://instagram.com/_dulzuras.nickynicole"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-purple-700"
          >
            @_dulzuras.nickynicole
          </a>
        </div>

        <div className="flex items-center gap-2">
          <FaWhatsapp className="text-green-600" />
          <a
            href="https://wa.me/56974062743"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            WhatsApp
          </a>
        </div>

        <div className="flex items-center gap-2">
          <FaTiktok className="text-black" />
          <span className="text-gray-500 italic">Próximamente en TikTok</span>
        </div>

        <div className="flex items-center gap-2">
          <FaEnvelope className="text-purple-700" />
          <a
            href="mailto:dulzuras.nickynicole@gmail.com"
            className="hover:underline text-purple-700"
          >
            dulzuras.nickynicole@gmail.com
          </a>
        </div>
      </div>

      {/* Info local y horario */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt />
          <span>Puente Alto, Santiago de Chile</span>
        </div>

        <div className="flex items-center gap-2">
          <FaClock />
          <span>Atención: 10:00 a 18:00 hrs</span>
        </div>
      </div>

      {/* Derechos reservados */}
      <p className="mt-4 text-xs text-gray-500">
        © 2025 Dulzuras de Nicky Nicole. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;

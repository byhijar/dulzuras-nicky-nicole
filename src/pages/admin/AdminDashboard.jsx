import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <img src="/logo-nicky-transparent.png" className="h-8 w-auto object-contain bg-purple-50 rounded-full" />
                    <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm px-4 py-2 rounded hover:bg-red-50 transition"
                >
                    Cerrar Sesión
                </button>
            </nav>

            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
                        <p className="text-gray-500 mt-1">Administra tu catálogo desde aquí.</p>
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow hover:bg-purple-700 transition font-bold flex items-center gap-2">
                        <span>+</span> Nuevo Producto
                    </button>
                </header>

                {/* Placeholder for Product List Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Próximamente: Lista de Productos</h3>
                    <p className="text-gray-500">Aquí podrás ver, editar y eliminar tus productos.</p>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;

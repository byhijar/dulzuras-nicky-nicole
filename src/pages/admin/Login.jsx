import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const googleProvider = new GoogleAuthProvider();

    const allowedEmails = ["dulzuras.nickynicole@gmail.com", "byhijar@gmail.com"];

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            let userCredential;

            if (isLogin) {
                // Login
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Register
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            }

            const user = userCredential.user;
            redirectUser(user);

        } catch (err) {
            console.error("Auth failed:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Este correo ya está registrado.");
            } else if (err.code === 'auth/weak-password') {
                setError("La contraseña debe tener al menos 6 caracteres.");
            } else {
                setError("Error de autenticación. Verifica tus datos.");
            }
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            redirectUser(result.user);
        } catch (err) {
            console.error("Google Login failed:", err);
            setError("Error al iniciar sesión con Google.");
        }
    };

    const redirectUser = (user) => {
        if (allowedEmails.includes(user.email)) {
            navigate('/admin');
        } else {
            navigate('/perfil');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-purple-900">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('/assets/hero-bg.jpg')] bg-cover bg-center opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-pink-600/50"></div>

            {/* Card */}
            <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="text-center mb-8">
                    <img src="/logo-nicky-transparent.png" alt="Logo" className="h-20 mx-auto object-contain mb-4 bg-purple-50 rounded-full p-2 shadow-md" />
                    <h1 className="text-3xl font-extrabold text-purple-900 mb-2">
                        {isLogin ? "¡Hola de nuevo!" : "Únete a nosotros"}
                    </h1>
                    <p className="text-purple-600 font-medium">
                        {isLogin ? "Ingresa para ver tus pedidos" : "Crea tu cuenta para empezar"}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-purple-50 p-1 rounded-xl mb-8">
                    <button
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${isLogin ? "bg-white text-purple-700 shadow-sm transform scale-105" : "text-gray-500 hover:text-purple-600"}`}
                        onClick={() => { setIsLogin(true); setError(null); }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${!isLogin ? "bg-white text-purple-700 shadow-sm transform scale-105" : "text-gray-500 hover:text-purple-600"}`}
                        onClick={() => { setIsLogin(false); setError(null); }}
                    >
                        Registrarse
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleAuthAction} className="space-y-5">
                    {!isLogin && (
                        <div className="relative group">
                            <FaUser className="absolute top-4 left-4 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Tu Nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-purple-50/50 border border-purple-100 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <FaEnvelope className="absolute top-4 left-4 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-purple-50/50 border border-purple-100 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <FaLock className="absolute top-4 left-4 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-purple-50/50 border border-purple-100 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:scale-95"
                    >
                        {isLogin ? "Ingresar" : "Crear Cuenta"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">O continúa con</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all duration-200 group"
                    >
                        <FaGoogle className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span>Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;

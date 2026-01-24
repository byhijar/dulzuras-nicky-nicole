import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function RequireAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const location = useLocation();
    const auth = getAuth();

    const allowedEmails = ["dulzuras.nickynicole@gmail.com", "byhijar@gmail.com"];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && allowedEmails.includes(currentUser.email)) {
                setUser(currentUser);
                setIsAuthorized(true);
            } else if (currentUser) {
                // User logged in but not authorized
                setUser(null);
                setIsAuthorized(false);
                // Optional: Force logout in background logic or just deny access
                auth.signOut();
                alert("Acceso denegado: Tu email no tiene permisos de administrador.");
            } else {
                setUser(null);
                setIsAuthorized(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        // Redirect to login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

export default RequireAuth;

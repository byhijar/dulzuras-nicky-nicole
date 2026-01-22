import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="p-8 m-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <h2 className="text-2xl font-bold mb-4">¡Algo salió mal! 😟</h2>
                    <p className="mb-4">Se ha producido un error inesperado al cargar esta sección.</p>

                    <details className="whitespace-pre-wrap bg-white p-4 rounded border border-red-100 text-sm font-mono overflow-auto max-h-96">
                        <summary className="cursor-pointer font-semibold mb-2">Ver detalles del error (para soporte técnico)</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Recargar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

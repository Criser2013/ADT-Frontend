import { createContext, useContext } from "react";

export const credencialesContext = createContext(null);

/**
 * Hook para acceder al contexto de credenciales.
 * @returns {Object}
 */
export const useCredenciales = () => {
    const context = useContext(credencialesContext);

    if (!context) {
        throw new Error(
            "useCredenciales debe usarse dentro de CredencialesProvider."
        );
    }

    return context;
};
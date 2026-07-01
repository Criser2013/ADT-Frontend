import { createContext, useContext } from "react";

export const CredencialesContext = createContext(null);

/**
 * Hook para acceder al contexto de credenciales.
 * @returns {Object}
 */
export const useCredenciales = () => {
    const context = useContext(CredencialesContext);

    if (!context) {
        throw new Error(
            "useCredenciales debe usarse dentro de CredencialesProvider."
        );
    }

    return context;
};
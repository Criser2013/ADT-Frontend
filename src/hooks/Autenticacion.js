import { createContext, useContext } from "react";

export const authContext = createContext();

/**
 * Otorga acceso al contexto de autenticación de la aplicación.
 * @returns {Object} Objeto con el estado y funciones relacionadas con la autenticación.
 */
export const useAuth = () => {
    const context = useContext(authContext);

    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider.");
    }

    return context;
};

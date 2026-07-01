import { createContext, useContext } from "react";

export const NavegacionContext = createContext();

/**
 * Otorga acceso al contexto de navegación de la aplicación.
 * @returns {Object} Objeto con el estado y funciones relacionadas con la navegación.
 */
export function useNavegacion() {
    const context = useContext(NavegacionContext);
    if (!context) {
        throw new Error("useNavegacion debe ser usado dentro de un NavegacionProvider.");
    }
    return context;
};
import { createContext, useContext } from "react";

export const navegacionContext = createContext();

/**
 * Otorga acceso al contexto de navegación de la aplicación.
 * @returns {Object} Objeto con el estado y funciones relacionadas con la navegación.
 */
export function useNavegacion() {
    const context = useContext(navegacionContext);
    if (!context) {
        throw new Error("useNavegacion debe ser usado dentro de un NavegacionProvider.");
    }
    return context;
};
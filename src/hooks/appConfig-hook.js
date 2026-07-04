import { createContext, useContext } from "react";

export const AppConfigContext = createContext(null);

/**
 * Hook para acceder al contexto de credenciales.
 * @returns {Object}
 */
export const useAppConfig = () => {
    const context = useContext(AppConfigContext);

    if (!context) {
        throw new Error(
            "useAppConfig debe usarse dentro de AppConfigProvider."
        );
    }

    return context;
};
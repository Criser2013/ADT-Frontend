import { NavegacionContext } from "../hooks/navegacion-hook";
import { useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";


/**
 * Proveedor del contexto que permite gestionar el estado de la navegación.
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export function NavegacionProvider({ children }) {
    const paginaAnterior = useRef(null);
    const { i18n } = useTranslation();
    const idioma = useMemo(() => i18n.language.split("-")[0], [i18n.language]);

    const cambiarIdioma = useCallback((idioma) => {
        i18n.changeLanguage(idioma);
    }, [i18n]);

    const value = useMemo(() => ({
        paginaAnterior, idioma, cambiarIdioma
    }), [idioma, cambiarIdioma]);

    return (
        <NavegacionContext value={value}>
            {children}
        </NavegacionContext>
    );
};
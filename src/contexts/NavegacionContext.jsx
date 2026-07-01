import { useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@mui/material/styles";

/**
 * Proveedor del contexto que permite gestionar el estado de la navegación.
 * @param {JSX.Element} children
 * @returns {JSX.Element}
 */
export function NavegacionProvider({ children }) {
    const paginaAnterior = useRef(null);
    const callbackError = useRef(null);
    const { mode, setMode } = useColorScheme();
    const { i18n } = useTranslation();
    const idioma = useMemo(() => i18n.language.split("-")[0], [i18n.language]);
    const tema = useMemo(() => {
        if ((mode === "system") || !mode) {
            return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        } else {
            return mode;
        }
    }, [mode]);

    const cambiarTema = useCallback(() => {
        switch (mode) {
            case "light":
                setMode("dark");
                break;
            case "dark":
                setMode("light");
                break;
            case undefined:
                setMode("system");
                break;
            default:
                // Es alreves porque se esta cambiando
                if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                    setMode("dark");
                } else {
                    setMode("light");
                }
                break;
        }
    }, [mode, setMode]);

    const cambiarIdioma = useCallback((idioma, loc = location) => {
        i18n.changeLanguage(idioma);
        loc.reload();
    }, [i18n]);

    const value = useMemo(() => ({
        paginaAnterior, callbackError, cambiarTema, tema, idioma, cambiarIdioma
    }), [tema, idioma, cambiarIdioma, cambiarTema]);

    return (
        <navegacionContext.Provider value={value}>
            {children}
        </navegacionContext.Provider>
    );
};
import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";


export const idiomaEspanol = "es";
export const idiomaIngles = "en";

/**
 * Hook personalizado que proporciona el idioma actual de la aplicación y una función para cambiarlo.
 * @returns {Object} Objeto con las claves:
 * - idioma: Idioma actual de la aplicación (valores posibles: "es", "en").
 * - cambiarIdioma: Función que cambia el idioma actual.
 */
export default function useIdioma() {
    const { i18n } = useTranslation();
    const idioma = useMemo(() => i18n.language.split("-")[0], [i18n.language]);

    /**
     * @param {String} idioma Código de idioma a cambiar.
     */
    const cambiarIdioma = useCallback((idioma) => {
        i18n.changeLanguage(idioma);
    }, [i18n]);

    const value = useMemo(() => ({
        idioma, cambiarIdioma
    }), [idioma, cambiarIdioma]);
    return value;
};
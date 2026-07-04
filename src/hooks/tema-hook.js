import { useCallback, useMemo } from "react";
import { useColorScheme } from "@mui/material/styles";

export const temaOscuro = "dark";
export const temaClaro = "light";
export const temaSistema = "system";

/**
 * Hook personalizado que proporciona el tema actual de la aplicación y una función para cambiarlo.
 * @returns {Object} Objeto con las claves:
 * - tema: Tema actual de la aplicación (valores posibles: "light", "dark").
 * - cambiarTema: Función que cambia el tema actual.
 */
export default function useTema() {
    const { mode, setMode } = useColorScheme();
    const tema = useMemo(() => {
        if ((mode === temaSistema) || !mode) {
            return window.matchMedia("(prefers-color-scheme: light)").matches ? temaClaro : temaOscuro;
        } else {
            return mode;
        }
    }, [mode]);

    const cambiarTema = useCallback(() => {
            switch (mode) {
                case temaClaro:
                    setMode(temaOscuro);
                    break;
                case temaOscuro:
                    setMode(temaClaro);
                    break;
                case undefined:
                    setMode(temaSistema);
                    break;
                default:
                    // Es alreves porque se esta cambiando
                    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                        setMode(temaOscuro);
                    } else {
                        setMode(temaClaro);
                    }
                    break;
            }
        }, [mode, setMode]);

    const value = useMemo(() => ({
             tema, cambiarTema
        }), [tema, cambiarTema]);

    return value;
};
import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useColorScheme } from "@mui/material/styles";

export const navegacionContext = createContext();

/**
 * Otorga acceso al contexto de navegación de la aplicación.
 * @returns React.Context<NavegacionContextType>
 */
export const useNavegacion = () => {
    const context = useContext(navegacionContext);
    if (!context) {
        console.log("Error creando el contexto.");
    }
    return context;
};

/**
 * Proveedor del contexto que permite gestionar el estado de la navegación.
 * @param {JSX.Element} children
 * @returns JSX.Element
 */
export function NavegacionProvider({ children }) {
    const [paginaAnterior, setPaginaAnterior] = useState(null);
    /* Callback para manejar errores que se puedan presentar.
       este se utiliza en el componente App.jsx para mostrar un modal
       con el error. El callback se ejecuta al dar clic en el botón de cerrar. */
    const [callbackError, setCallbackError] = useState({ fn: null });
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [cerrandoMenu, setCerrandoMenu] = useState(false);
    const [dispositivoMovil, setDispositivoMovil] = useState(null);
    const [variantSidebar, setVariantSidebar] = useState("permanent");
    const [orientacion, setOrientacion] = useState("horizontal");
    const [ancho, setAncho] = useState(window.viewport.segments[0].width);
    const [alto, setAlto] = useState(window.viewport.segments[0].height);
    const { mode, setMode } = useColorScheme();
    const tema = useMemo(() => {
        if (mode == "system" || mode == undefined) {
            if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                return "light";
            } else {
                return "dark";
            }
        } else {
            return mode;
        }
    }, [mode]);

    /**
     * Detecta si el usuario está en un dispositivo móvil. Ajusta el menú lateral
     * dependiendo de ello.z
     */
    useEffect(() => {
        const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
        const dispositivoMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const variantSidebar = (dispositivoMovil && orientacion == "vertical") ? "temporary" : "permanent";

        setVariantSidebar(variantSidebar);
        setDispositivoMovil(dispositivoMovil);
        setMostrarMenu(!dispositivoMovil || (dispositivoMovil && orientacion == "horizontal"));

        detTamPantalla();
    }, [navigator.userAgent, orientacion]);

    /**
     * Añade un escucha cuando la ventana cambia de tamaño.
     */
    useEffect(() => {
        window.addEventListener('resize', detTamPantalla);

        return () => {
            window.removeEventListener('resize', detTamPantalla);
        };
    }, []);

    /**
     * Detecta la orientación de la pantalla y ajusta el estado.
     * @param {Int} ancho 
     * @param {Int} alto 
     */
    const detecOrientacion = (ancho, alto) => {
        if (ancho >= alto) {
            setOrientacion("horizontal");
        } else {
            setOrientacion("vertical");
        }
    };

    /**
     * Detecta el tamaño de la pantalla y ajusta el estado del ancho, alto,
     */
    const detTamPantalla = () => {
        const ancho = window.viewport.segments[0].width;
        const alto = window.viewport.segments[0].height;

        setAncho(ancho);
        setAlto(alto);

        if (ancho < 600 && !dispositivoMovil) {
            setVariantSidebar("temporary");
            setMostrarMenu(false);
        } else if (ancho >= 600 && !dispositivoMovil) {
            setVariantSidebar("permanent");
            setMostrarMenu(true);
        }

        detecOrientacion(ancho, alto);
    };

    /**
     * Maneja el cambio de temas según la preferencia del usuario o el sistema.
     */
    const cambiarTema = () => {
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
    };

    return (
        <navegacionContext.Provider value={{
            paginaAnterior, setPaginaAnterior, callbackError, setCallbackError, mostrarMenu, setMostrarMenu, cerrandoMenu,
            variantSidebar, setCerrandoMenu, dispositivoMovil, orientacion, ancho, alto, cambiarTema, tema
        }}>
            {children}
        </navegacionContext.Provider>
    );
}
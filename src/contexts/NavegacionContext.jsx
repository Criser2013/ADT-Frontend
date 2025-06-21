import { createContext, useState, useContext, useEffect } from "react";

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

    /**
     * Detecta si el usuario está en un dispositivo móvil. Ajusta el menú lateral
     * dependiendo de ello.
     */
    useEffect(() => {
        const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
        const dispositivoMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const variantSidebar = dispositivoMovil ? "temporary" : "permanent";

        setVariantSidebar(variantSidebar);
        setDispositivoMovil(dispositivoMovil);
        setMostrarMenu(!dispositivoMovil);
    }, [navigator.userAgent]);

    return (
        <navegacionContext.Provider value={{ paginaAnterior, setPaginaAnterior, callbackError, setCallbackError, mostrarMenu, setMostrarMenu, cerrandoMenu, variantSidebar, setCerrandoMenu, dispositivoMovil}}>
            {children}
        </navegacionContext.Provider>
    );
}
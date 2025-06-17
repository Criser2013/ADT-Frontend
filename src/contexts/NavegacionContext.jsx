import { createContext, useState, useContext } from "react";

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

    return (
        <navegacionContext.Provider value={{ paginaAnterior, setPaginaAnterior, callbackError, setCallbackError }}>
            {children}
        </navegacionContext.Provider>
    );
}
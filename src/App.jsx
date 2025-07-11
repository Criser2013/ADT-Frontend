import Router from "../router";
import { useAuth } from "./contexts/AuthContext";
import { useCredenciales } from "./contexts/CredencialesContext";
import { useEffect, useState } from "react";
import { useNavegacion } from "./contexts/NavegacionContext";
import ModalSimple from "./components/modals/ModalSimple";
import ModalAccion from "./components/modals/ModalAccion";

/**
 * Componente principal que provee las credenciales de autenticación y muestra los 
 * errores relacionados con el servicio de autenticación.
 * @returns JSX.Element
 */
export default function App() {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const [modal, setModal] = useState({
        mostrar: false, mensaje: ""
    });
    const [modal2Btn, setModal2Btn] = useState({
        mostrar: false, mensaje: "", titulo: "", txtBtn: ""
    });

    /**
     * Actualiza las instancia de Firebase y permisos de Drive
     * cuando se cargan las credenciales.
    */
    useEffect(() => {
        auth.setAuth(credenciales.obtenerInstanciaAuth());
        auth.setDb(credenciales.obtenerInstanciaDB());
        auth.setScopes(credenciales.scopesDrive);
    }, [credenciales]);

    useEffect(() => {
        let compsModal = {
            mostrar: !auth.permisos, mensaje: "Debes otorgar los permisos requeridos en tu cuenta de Google.",
            titulo: "Permisos insuficientes", txtBtn: "Conceder permisos"
        };
        if (auth.requiereRefresco) {
            compsModal = {
                mostrar: true, titulo: "La sesión ha caducado", txtBtn: "Extender sesión",
                mensaje: "Tu sesión ha caducado, por favor reautentícate para continuar utilizando la aplicación."
            };
        }
        setModal2Btn(compsModal);
    }, [auth.permisos, auth.requiereRefresco]);

    /** 
     * Escucha y muestra los errores de autenticación que se presenten.
    */
    useEffect(() => {
        if (!auth.cargando && auth.authError.res) {
            setModal({ mostrar: true, mensaje: auth.authError.error });
        } else {
            setModal({ ...modal, mostrar: false });
        }
    }, [auth.cargando, auth.authError.res, auth.authError.error]);

    /**
     * Manejador de eventos del botón de cerrar el modal de error.
     */
    const manejadorBtnModal = () => {
        setModal({ ...modal, mostrar: false });

        if ((navegacion.callbackError.fn != null) && (typeof (navegacion.callbackError.fn) == "function")) {
            navegacion.callbackError.fn();
        }

        navegacion.setCallbackError({ fn: null });
    };

    /**
     * Manejador de eventos del botón de reintentar.
     */
    const manejadorBtnPermisos = async () => {
        setModal2Btn(false);

        const { user } = auth.authInfo;
        await auth.reautenticarUsuario(user);
    };

    /**
     * Manejador de eventos del botón de cerrar sesión.
     * Solo está presente cuando el usuario no ha otorgado los permisos.
     */
    const manejadorBtnCerrarSesion = () => {
        setModal2Btn({ ...modal2Btn, mostrar: false });
        navegacion.setPaginaAnterior(window.location.pathname);

        location.replace("/cerrar-sesion");
    };

    /**
     * Manejador del botón para extender la sesión.
     */
    const manejadorBtnReautenticar = () => {
        const { user } = auth.authInfo;
        setModal2Btn({ ...modal2Btn, mostrar: false });
        auth.reautenticarUsuario(user);
    };

    return (
        <>
            <Router />
            <ModalAccion
                abrir={modal.mostrar}
                mensaje={modal.mensaje}
                titulo="Aviso"
                manejadorBtnPrimario={auth.permisos ? manejadorBtnPermisos : manejadorBtnReautenticar}
                manejadorBtnSecundario={manejadorBtnCerrarSesion}
                mostrarBtnSecundario={true}
                txtBtnSimple={modal2Btn.txtBtn}
                txtBtnSecundario="Cerrar sesión"
                txtBtnSimpleAlt={modal2Btn.txtBtn}
            />
            <ModalSimple
                abrir={modal.mostrar}
                titulo="Error"
                mensaje={modal.mensaje}
                manejadorCerrar={manejadorBtnModal}
                txtBtn="Cerrar"
            />
        </>
    );
};
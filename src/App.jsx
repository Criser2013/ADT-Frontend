import Router from "../router";
import { useAuth } from "./contexts/AuthContext";
import { useCredenciales } from "./contexts/CredencialesContext";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogActions, DialogTitle, Button, Typography } from "@mui/material";
import { useNavegacion } from "./contexts/NavegacionContext";

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
        setModal({ mostrar: false, mensaje: "" });

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
            <Dialog open={modal2Btn.mostrar}>
                <DialogTitle>Aviso</DialogTitle>
                <DialogContent>
                    <Typography>{modal2Btn.mensaje}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={manejadorBtnCerrarSesion}
                        sx={{ textTransform: "none" }}>
                        <b>Cerrar sesión</b>
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={auth.permisos ? manejadorBtnPermisos : manejadorBtnReautenticar}
                        sx={{ textTransform: "none" }}>
                        <b>{modal2Btn.txtBtn}</b>
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={modal.mostrar}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Typography>{modal.mensaje}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={manejadorBtnModal}
                        sx={{ textTransform: "none" }}>
                        <b>Cerrar</b>
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
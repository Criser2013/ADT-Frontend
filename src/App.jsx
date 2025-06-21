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

    /**
     * Actualiza las instancia de Firebase y permisos de Drive
     * cuando se cargan las credenciales.
    */
    useEffect(() => {
        auth.setAuth(credenciales.obtenerInstanciaAuth());
        auth.setDb(credenciales.obtenerInstanciaDB());
        auth.setScopes(credenciales.scopesDrive);
    }, [auth, credenciales]);

    /** 
     * Escucha y muestra los errores de autenticación que se presenten.
    */
    useEffect(() => {
        if (!auth.cargando && auth.authError.res) {
            setModal({ mostrar: true, mensaje: auth.authError.error });
        } else {
            setModal({ mostrar: false, mensaje: "" });
        }
    }, [auth.cargando, auth.authError.res, auth.authError.error]);

    /**
     * Manejador de eventos del botón de cerrar el modal de error.
     */
    const manejadorBtnModal = () => {
        if ((navegacion.callbackError.fn != null) && (typeof(navegacion.callbackError.fn) == "function")) {
            navegacion.callbackError.fn();
        }

        setModal({ mostrar: false, mensaje: "" });
        navegacion.setCallbackError({ fn: null });
    };

    return (
        <>
            <Router />
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
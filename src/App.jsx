import Router from "../router";
import { useAuth } from "./contexts/AuthContext";
import { useCredenciales } from "./contexts/CredencialesContext";
import { useEffect, useState } from "react";
import { useNavegacion } from "./contexts/NavegacionContext";
import { useTranslation } from "react-i18next";
import ModalSimple from "./components/modals/ModalSimple";
import ModalAccion from "./components/modals/ModalAccion";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import dayjs from "dayjs";
import { IconoPermisos } from "./components/icons/IconosModal";
import UpdateIcon from '@mui/icons-material/Update';

/**
 * Componente principal que provee las credenciales de autenticación y muestra los 
 * errores relacionados con el servicio de autenticación.
 * @returns {JSX.Element}
 */
export default function App() {
    const auth = useAuth();
    const { t } = useTranslation();
    const navegacion = useNavegacion();
    const credenciales = useCredenciales();
    const [modal, setModal] = useState({
        mostrar: false, mensaje: ""
    });
    const [modal2Btn, setModal2Btn] = useState({
        mostrar: false, mensaje: "", titulo: "", txtBtn: "", icono: null
    });

    /**
     * Actualiza las instancia de Firebase y permisos de Drive
     * cuando se cargan las credenciales.
    */
    useEffect(() => {
        import("dayjs/locale/es").then(() => {
            const idioma = localStorage.getItem("i18nextLng");
            if (idioma != null) {
                dayjs.locale(idioma);
            } else {
                dayjs.locale("es");
            }
        });
        auth.setAuth(credenciales.obtenerInstanciaAuth());
        auth.setDb(credenciales.obtenerInstanciaDB());
        auth.setScopes(credenciales.scopesDrive);
    }, [credenciales]);

    useEffect(() => {
        if (auth.autenticado != null && !auth.autenticado) {
            setModal2Btn(((x) => ({ ...x, mostrar: false })));
            return;
        }

        let compsModal = {
            mostrar: !auth.permisos, mensaje: t("txtModalPermisos"),
            titulo: t("titModalPermisos"), txtBtn: t("txtBtnPermisos"), icono: <IconoPermisos />
        };
        if (auth.requiereRefresco) {
            compsModal = {
                mostrar: true, titulo: t("titModalSesionCaducada"), txtBtn: t("txtBtnExtenderSesion"),
                mensaje: t("txtModalSesionCaducada"),
                icono: <UpdateIcon />
            };
        }
        setModal2Btn(compsModal);
    }, [auth.authInfo.user, auth.permisos, auth.requiereRefresco]);

    /** 
     * Escucha y muestra los errores de autenticación que se presenten.
    */
    useEffect(() => {
        if (!auth.cargando && auth.authError.res) {
            setModal({ mostrar: true, mensaje: auth.authError.error });
        } else {
            setModal((x) => ({ ...x, mostrar: false }));
        }
    }, [auth.cargando, auth.authError.res, auth.authError.error]);

    /**
     * Manejador de eventos del botón de cerrar el modal de error.
     */
    const manejadorBtnModal = () => {
        setModal((x) => ({ ...x, mostrar: false }));

        if ((navegacion.callbackError.fn != null) && (typeof (navegacion.callbackError.fn) == "function")) {
            navegacion.callbackError.fn();
        }

        navegacion.setCallbackError({ fn: null });
    };

    /**
     * Manejador de eventos del botón de reintentar.
     */
    const manejadorBtnPermisos = async () => {
        setModal2Btn((x) => ({ ...x, mostrar: false }));

        const { user } = auth.authInfo;

        if (user != null) {
            await auth.reautenticarUsuario(user);
        } else {
            await auth.iniciarSesionGoogle();
        }
    };

    /**
     * Manejador de eventos del botón de cerrar sesión.
     * Solo está presente cuando el usuario no ha otorgado los permisos.
     */
    const manejadorBtnCerrarSesion = () => {
        setModal2Btn((x) => ({ ...x, mostrar: false }));
        navegacion.setPaginaAnterior(window.location.pathname);

        location.replace("/cerrar-sesion");
    };

    /**
     * Manejador del botón para extender la sesión.
     */
    const manejadorBtnReautenticar = async () => {
        const { user } = auth.authInfo;
        setModal2Btn((x) => ({ ...x, mostrar: false }));

        if (user != null) {
            await auth.reautenticarUsuario(user);
        } else {
            await auth.iniciarSesionGoogle();
        }
    };

    return (
        <span style={{ height: "100vh", width: "100vw" }}>
            <Router />
            <ModalAccion
                abrir={modal2Btn.mostrar}
                mensaje={modal2Btn.mensaje}
                titulo={modal2Btn.titulo}
                manejadorBtnPrimario={auth.requiereRefresco ? manejadorBtnReautenticar : manejadorBtnPermisos}
                manejadorBtnSecundario={manejadorBtnCerrarSesion}
                mostrarBtnSecundario={true}
                txtBtnSimple={modal2Btn.txtBtn}
                txtBtnSecundario={t("txtBtnCerrarSesion")}
                iconoBtnSecundario={<LogoutIcon />}
                iconoBtnPrincipal={modal2Btn.icono}
                txtBtnSimpleAlt={modal2Btn.txtBtn}
            />
            <ModalSimple
                abrir={modal.mostrar}
                titulo={t("tituloErr")}
                mensaje={modal.mensaje}
                manejadorBtnModal={manejadorBtnModal}
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
            />
        </span>
    );
};
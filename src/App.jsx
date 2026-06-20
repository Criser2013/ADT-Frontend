
import { useAuth } from "./contexts/AuthContext";
import { useCredenciales } from "./contexts/CredencialesContext";
import { useEffect, useState } from "react";
import { useNavegacion } from "./contexts/NavegacionContext";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import Router from "../router";
import ModalSimple from "./components/modals/ModalSimple";
import ModalAccion from "./components/modals/ModalAccion";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import UpdateIcon from '@mui/icons-material/Update';
import dayjs from "dayjs";
import { IconoPermisos } from "./components/icons/IconosModal";


/**
 * Componente principal que provee las credenciales de autenticación y muestra los 
 * errores relacionados con el servicio de autenticación.
 * @returns {JSX.Element}
 */
export default function App() {
    const { cargando, error, autenticado, requiereRefresco, setAuth, setScopes, autenticar } = useAuth();
    const { t } = useTranslation();
    const navegacion = useNavegacion();
    const navigate = useNavigate();
    const location = useLocation();
    const { firebaseAuth, scopesDrive } = useCredenciales();
    const [modal, setModal] = useState({
        mostrar: false, mensaje: ""
    });
    const [modal2Btn, setModal2Btn] = useState({
        mostrar: false, mensaje: "", titulo: "", txtBtn: "", icono: null
    });

    /**
     * Configura el formato en que se mostrarán las fechas de la aplicación según
     * el idioma seleccionado por el usuario.
     */
    useEffect(() => {
        import("dayjs/locale/es").then(() => {
            const idioma = localStorage.getItem("i18nextLng");
            dayjs.locale(idioma ? idioma : "es");
        });
    }, []);

    /**
     * Actualiza las instancia de Firebase y permisos de Drive
     * cuando se cargan las credenciales.
    */
    useEffect(() => { 
        setAuth(firebaseAuth);
        setScopes(scopesDrive);
    }, [firebaseAuth, scopesDrive]);

    /**
     * Muestra un modal para extender la sesión cuando el token de acceso ha caducado o está por caducar.
     */
    useEffect(() => {
        if (requiereRefresco) {
            setModal2Btn({
                mostrar: true, titulo: t("titModalSesionCaducada"), mensaje: t("txtModalSesionCaducada"),
                txtBtn: t("txtBtnExtenderSesion"), icono: <UpdateIcon />
            });
        }
    }, [requiereRefresco]);

    /** 
     * Muestra los errores de autenticación que se presenten en un modal.
    */
    useEffect(() => {
        if (error && error !== "errPermisos") {
            setModal({ mostrar: true, mensaje: t(error) });
        } else if (error === "errPermisos") {
            setModal2Btn({
                mostrar: true, mensaje: t("txtModalPermisos"), titulo: t("titModalPermisos"),
                txtBtn: t("txtBtnPermisos"), icono: <IconoPermisos />
            });
        }
    }, [error]);

    /**
     * Manejador de eventos del botón de cerrar el modal de error.
     */
    const manejadorBtnModalSimple = () => {
        setModal((x) => ({ ...x, mostrar: false }));

        if ((navegacion.callbackError.fn != null) && (typeof (navegacion.callbackError.fn) == "function")) {
            navegacion.callbackError.fn();
        }

        navegacion.setCallbackError({ fn: null });
    };

    /**
     * Manejador de eventos del botón que se muestra en el modal para autenticar un usuario
     * cuando la sesión ha caducado o el usuario no ha otorgado los permisos necesarios.
     */
    const manejadorBtnAutenticar = async () => {
        setModal2Btn((x) => ({ ...x, mostrar: false }));
        await autenticar();
    };

    /**
     * Manejador de eventos del botón de cerrar sesión.
     * Solo está presente cuando el usuario no ha otorgado los permisos.
     */
    const manejadorBtnCerrarSesion = () => {
        setModal2Btn((x) => ({ ...x, mostrar: false }));
        navegacion.setPaginaAnterior(location.pathname);
        navigate("/cerrar-sesion", { replace: true });
    };

    return (
        <span style={{ height: "100vh", width: "100vw" }}>
            <Router />
            <ModalAccion
                abrir={modal2Btn.mostrar}
                mensaje={modal2Btn.mensaje}
                titulo={modal2Btn.titulo}
                manejadorBtnPrimario={manejadorBtnAutenticar}
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
                manejadorBtnModal={manejadorBtnModalSimple}
                txtBtn={t("txtBtnCerrar")}
                iconoBtn={<CloseIcon />}
            />
        </span>
    );
};
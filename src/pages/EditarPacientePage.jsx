import { Box, CircularProgress } from "@mui/material";
import { useDrive } from "../contexts/DriveContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect, useState } from "react";
import FormAnadirPaciente from "../components/tabs/FormAnadirPaciente";
import TabHeader from "../components/tabs/TabHeader";
import MenuLayout from "../components/layout/MenuLayout";
import { detTamCarga } from "../utils/Responsividad";
import { useNavigate, useSearchParams } from "react-router";
import { validarNumero } from "../utils/Validadores";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

/**
 * Página para editar los datos de un paciente.
 * @returns JSX.Element
 */
export default function EditarPacientePage() {
    const auth = useAuth();
        const drive = useDrive();
        const navegacion = useNavegacion();
        const navigate = useNavigate();
        const [params, setParams] = useSearchParams();
        const [cargando, setCargando] = useState(true);
        const [datos, setDatos] = useState({
            personales: {
                nombre: "",
                cedula: "",
                sexo: "",
                telefono: "",
                fechaNacimiento: null
            },
            comorbilidades: []
        });
        const listadoPestanas = [
            { texto: "Lista de pacientes", url: "/pacientes" },
            { texto: "Editar paciente", url: `/pacientes/editar${location.search}` }
        ];
        const ced = params.get("cedula");
    
        /**
         * Carga el token de sesión y comienza a descargar el archivo de pacientes.
         */
        useEffect(() => {
            const token = sessionStorage.getItem("session-tokens");
            if (token != null) {
                drive.setToken(JSON.parse(token).accessToken);
            } else if (auth.tokenDrive != null) {
                drive.setToken(auth.tokenDrive);
            }
        }, [auth.tokenDrive]);
    
        /**
         * Quita la pantalla de carga cuando se haya descargado el archivo de pacientes.
         */
        useEffect(() => {
            if (!drive.descargando) {
                cargarDatosPaciente();
            }

            setCargando(drive.descargando);
        }, [drive.descargando]);
    
        /**
         * Coloca el título de la página.
         */
        useEffect(() => {
            document.title = `Editar paciente`;
            const res = (ced != null && ced != undefined) ? validarNumero(ced): false;

            if (!res) {
                navigate("/pacientes", { replace: true });
            }
        }, []);

        /**
         * Carga los datos del paciente a editar.
         */
        const cargarDatosPaciente = () => {
            const res = drive.cargarDatosPaciente(ced);
            if (res.success) {
                dayjs.extend(customParseFormat);
                res.data.personales.fechaNacimiento = dayjs(res.data.personales.fechaNacimiento, "DD-MM-YYYY");
                setDatos(res.data);
            } else {
                navigate("/pacientes", { replace: true });
            }
        };
    
        return (
            <MenuLayout>
                {(cargando || auth.cargando) ? (
                    <Box display="flex" justifyContent="center" alignItems="center" width={detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho)} height="85vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TabHeader
                            urlPredet="/pacientes"
                            titulo="Editar paciente"
                            pestanas={listadoPestanas}
                            tooltip="Volver a la pestaña de pacientes" />
                        <FormAnadirPaciente
                            listadoPestanas={listadoPestanas}
                            esAnadir={false}
                            setCargando={setCargando}
                            nombre={datos.personales.nombre}
                            cedula={datos.personales.cedula}
                            sexo={datos.personales.sexo}
                            telefono={datos.personales.telefono}
                            fechaNacimiento={datos.personales.fechaNacimiento}
                            otrasEnfermedades={datos.comorbilidades}
                        />
                    </>
                )}
            </MenuLayout>
        );
};
import { Button, Grid } from "@mui/material";
import Datatable from "../components/tabs/Datatable";
import TabHeader from "../components/tabs/TabHeader";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router";
import { useNavegacion } from "../contexts/NavegacionContext";
import { useEffect } from "react";

/**
 * Página para ver la lista de pacientes.
 * @returns JSX.Element
 */
export default function ListaPacientesPage() {
    const navigate = useNavigate();
    const navegacion = useNavegacion();
    const listadoPestanas = [{
        texto: "Lista de pacientes", url: "/pacientes"
    }];

    useEffect(() => {
        document.title = "Lista de pacientes";
    }, []);

    const manejadorBtnAnadir = () => {
        navegacion.setPaginaAnterior("/pacientes");
        navigate("/pacientes/anadir", { replace: true });
    };

    const datos = [{ id: 1, nombre: "BJF", xd: "XD" },
    { id: 2, nombre: "BJF2", xd: "XD2" },
    { id: 3, nombre: "BJF3", xd: "XD" },
    { id: 4, nombre: "BJF4", xd: "XD2" },
    { id: 5, nombre: "BJF5", xd: "XD" },
    { id: 6, nombre: "BJF6", xd: "XD2" },
    { id: 7, nombre: "BJF7", xd: "XD" },
    { id: 8, nombre: "BJF8", xd: "XD2" },
    { id: 9, nombre: "BJF9", xd: "XD" },
    { id: 10, nombre: "BJF10", xd: "XD2" },
    { id: 11, nombre: "BJF11", xd: "XD" },
    { id: 12, nombre: "BJF12", xd: "XD2" },
    { id: 13, nombre: "BJF12", xd: "XD" },
    { id: 14, nombre: "BJF14", xd: "XD2" },
    ]

    return (
        <>
            <TabHeader
                activarBtnAtras={false}
                titulo="Lista de pacientes"
                pestanas={listadoPestanas} />
            <Grid container columns={1} spacing={2} sx={{ marginTop: "3vh" }}>
                <Grid size={1} display="flex" justifyContent="end">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={manejadorBtnAnadir}
                        sx={{ textTransform: "none" }}
                        startIcon={<AddIcon />}>
                        <b>Añadir paciente</b>
                    </Button>
                </Grid>

            </Grid>
            <Datatable
                campos={[
                    { id: 'nombre', label: 'Nombre' },
                    { id: 'xd', label: 'XD' }
                ]}
                datos={datos}
            />
        </>
    );
};
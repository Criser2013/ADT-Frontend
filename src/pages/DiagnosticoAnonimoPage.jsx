import {
    Grid, Button, Typography, TextField, Stack, Tooltip, Box,
    CircularProgress, MenuItem } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import TabHeader from "../components/tabs/TabHeader";
import { useNavegacion } from "../contexts/NavegacionContext";
import { detTamCarga } from "../utils/Responsividad";
import Check from "../components/tabs/Check";
import SelectChip from "../components/tabs/SelectChip";
import { COMORBILIDADES } from "../../constants";
import CloseIcon from "@mui/icons-material/Close";
import { DiagnosticoIcono } from "../components/icons/IconosSidebar";
import { validarNumero } from "../utils/Validadores";
import { oneHotEncondingOtraEnfermedad, transformarDatos, validarArray } from "../utils/TratarDatos";
import MenuLayout from "../components/layout/MenuLayout";
import ModalSimple from "../components/modals/ModalSimple";
import { generarDiagnostico } from "../services/Api";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

export default function DiagnosticoAnonimoPage() {
    const auth = useAuth();
    const navegacion = useNavegacion();
    const [cargando, setCargando] = useState(false);
    const [modal, setModal] = useState({
        mostrar: false, titulo: "", mensaje: ""
    });
    const [datosTxt, setDatosTxt] = useState({
        sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
        frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: ""
    });
    const [datosBin, setDatosBin] = useState({
        fumador: false, bebedor: false, tos: false, fiebre: false,
        crepitaciones: false, dolorToracico: false, malignidad: false,
        hemoptisis: false, disnea: false, sibilancias: false,
        derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
        inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
        otraEnfermedad: false, soplos: false
    });
    const [diagnostico, setDiagnostico] = useState({
        resultado: false, probabilidad: 0, diagnosticado: false
    });
    const [desactivarCampos, setDesactivarCampos] = useState(false);
    const [otrasEnfermedades, setOtrasEnfermedades] = useState([]);
    const [errores, setErrores] = useState([
        { campo: "sexo", error: false, txt: "" },
        { campo: "edad", error: false, txt: "" },
        { campo: "presionSis", error: false, txt: "" },
        { campo: "presionDias", error: false, txt: "" },
        { campo: "frecuenciaRes", error: false, txt: "" },
        { campo: "frecuenciaCard", error: false, txt: "" },
        { campo: "so2", error: false, txt: "" },
        { campo: "plaquetas", error: false, txt: "" },
        { campo: "hemoglobina", error: false, txt: "" },
        { campo: "wbc", error: false, txt: "" },
        { campo: "comorbilidades", error: false, txt: "" },
    ]);
    const width = useMemo(() => {
        return detTamCarga(navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho);
    }, [navegacion.dispositivoMovil, navegacion.orientacion, navegacion.mostrarMenu, navegacion.ancho]);
    const listadoPestanas = [{
        texto: "Diagnóstico anónimo", url: "/diagnostico-anonimo"
    }];
    const sexos = [{ texto: "Seleccione el sexo", val: 2 },
    { texto: "Masculino", val: 0 },
    { texto: "Femenino", val: 1 }];
    const sintomas = useMemo(() => ([
        { texto: "Fumador", nombre: "fumador" },
        { texto: "Bebedor", nombre: "bebedor" },
        { texto: "Tos", nombre: "tos" },
        { texto: "Fiebre", nombre: "fiebre" },
        { texto: "Edema de miembros inferiores", nombre: "edema" },
        { texto: "Inmovilidad de miembros inferiores", nombre: "inmovilidad" },
        { texto: "Procedimiento quirúrgico reciente", nombre: "cirugiaReciente" },
        { texto: "Síntomas disautonómicos", nombre: "disautonomicos" },
        { texto: "Viaje prolongado", nombre: "viajeProlongado" },
        { texto: "Disnea", nombre: "disnea" },
        { texto: "Sibilancias", nombre: "sibilancias" },
        { texto: "Crepitaciones", nombre: "crepitaciones" },
        { texto: "Derrame", nombre: "derrame" },
        { texto: "Malignidad", nombre: "malignidad" },
        { texto: "Hemoptisis", nombre: "hemoptisis" },
        { texto: "Dolor torácico", nombre: "dolorToracico" },
        { texto: "TEP - TVP previo", nombre: "tepPrevio" },
        { texto: "Soplos", nombre: "soplos" }
    ]), []);
    const numCols = useMemo(() => {
        return navegacion.dispositivoMovil || (!navegacion.dispositivoMovil && (navegacion.ancho < 500)) ? 1 : 3;
    }, [navegacion.dispositivoMovil, navegacion.ancho]);

    useEffect(() => {
        document.title = "Diagnóstico anónimo";
    }, []);

    /**
     * Manejador de cambios para los datos de texto.
     * @param {Event} e 
     */
    const manejadorCambiosDatosTxt = (e) => {
        setDatosTxt({ ...datosTxt, [e.target.name]: e.target.value });
    };

    /**
     * Manejador de cambios para los datos binarios.
     * @param {Event} e 
     */
    const manejadorCambiosDatosBin = (e) => {
        setDatosBin({ ...datosBin, [e.target.name]: e.target.checked });
    };

    /**
     * Manejador de cambios para las comorbilidades.
     * @param {Event} e 
     */
    const manejadorCambiosComor = (e) => {
        setOtrasEnfermedades(e.target.value);
    };

    /**
     * Manejador del botón de vaciar campos.
     */
    const manejadorBtnVaciar = () => {
        setDesactivarCampos(false);
        setDiagnostico({ resultado: false, probabilidad: 0, diagnosticado: false });
        setDatosTxt({
            sexo: 2, edad: "", presionSis: "", presionDias: "", frecRes: "",
            frecCard: "", so2: "", plaquetas: "", hemoglobina: "", wbc: ""
        });
        setDatosBin({
            fumador: false, bebedor: false, tos: false, fiebre: false,
            crepitaciones: false, dolorToracico: false, malignidad: false,
            hemoptisis: false, disnea: false, sibilancias: false,
            derrame: false, tepPrevio: false, edema: false, disautonomicos: false,
            inmovilidad: false, viajeProlongado: false, cirugiaReciente: false,
            otraEnfermedad: false
        });
        setOtrasEnfermedades([]);
        setErrores(errores.map(e => ({ ...e, error: false, txt: "" })));
    };

    /**
     * Quita los errores de los campos en pantalla.
     */
    const limpiarErrores = () => {
        setErrores([
            { campo: "sexo", error: false, txt: "" },
            { campo: "edad", error: false, txt: "" },
            { campo: "presionSis", error: false, txt: "" },
            { campo: "presionDias", error: false, txt: "" },
            { campo: "frecuenciaRes", error: false, txt: "" },
            { campo: "frecuenciaCard", error: false, txt: "" },
            { campo: "so2", error: false, txt: "" },
            { campo: "plaquetas", error: false, txt: "" },
            { campo: "hemoglobina", error: false, txt: "" },
            { campo: "wbc", error: false, txt: "" },
            { campo: "comorbilidades", error: false, txt: "" },
        ]);
    };

    /**
     * Valida el campo que se indique, devuelve un JSON con el resultados.
     * @param {String} cod - Atributo "name" del campo que se está validando.
     * @returns JSON
     */
    const evaluarErrores = (cod) => {
        let res = { campo: cod, error: false, txt: "" };
        switch (true) {
            case (cod == "sexo" && datosTxt.sexo > 1):
                res = { error: true, txt: "Selecciona el sexo del paciente" };
                break;
            case (cod == "edad" && !validarNumero(datosTxt.edad)):
                res = { error: true, txt: "Edad inválida" };
                break;
            case (cod == "presionSis" && !validarNumero(datosTxt.presionSis)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "presionDias" && !validarNumero(datosTxt.presionDias)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "frecRes" && !validarNumero(datosTxt.frecRes)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "frecCard" && !validarNumero(datosTxt.frecCard)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "so2" && !validarNumero(datosTxt.so2)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "plaquetas" && !validarNumero(datosTxt.plaquetas)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "hemoglobina" && !validarNumero(datosTxt.hemoglobina)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "wbc" && !validarNumero(datosTxt.wbc)):
                res = { error: true, txt: "Solo debes ingresar números" };
                break;
            case (cod == "comorbilidades" && (datosBin.otraEnfermedad && otrasEnfermedades.length == 0)):
                res = { error: true, txt: "Selecciona al menos un padecimiento" };
                break;
            default:
                break;
        }
        res["campo"] = cod;
        return res;
    };

    /**
     * Muestra un modal de error cuando los datos son inválidos.
     */
    const mostrarErrDatosInv = () => {
        setModal({
            mostrar: true,
            titulo: "Datos inválidos.",
            mensaje: "Los valores de algunos campos son inválidos."
        });
    };

    /**
     * Manejador del botón de guardar.
     */
    const manejadorBtnDiagnosticar = () => {
        if (diagnostico.diagnosticado) {
            setModal({ mostrar: true, titulo: "Resultado del diagnóstico", mensaje: "" });
            return;
        }

        limpiarErrores();
        const res = validarArray(
            ["sexo", "edad", "presionSis", "presionDias", "frecRes",
                "frecCard", "so2", "plaquetas", "hemoglobina", "wbc", "comorbilidades"],
            evaluarErrores,
            (x) => !x.error,
            setErrores
        );

        if (!res) {
            mostrarErrDatosInv();
        } else {
            setCargando(true);
            diagnosticar();
        }
    };

    /**
     * Genera el diagnóstico y muestra el resultado en un modal.
     */
    const diagnosticar = async () => {
        const oneHotComor = oneHotEncondingOtraEnfermedad(datosBin.otraEnfermedad ? otrasEnfermedades : []);
        const datos = transformarDatos({ ...datosTxt, ...datosBin }, oneHotComor);

        const res = await generarDiagnostico(datos, auth.authInfo.user.accessToken);
        const { success, data } = res;

        if (!success) {
            setModal({ mostrar: true, titulo: "Error", mensaje: res.error });
        } else {
            setDesactivarCampos(true);
            setDiagnostico({ resultado: data.prediccion, probabilidad: data.probabilidad * 100, diagnosticado: true });
            setModal({ mostrar: true, titulo: "Resultado del diagnóstico", mensaje: "" });
        }

        setCargando(false);
    };

    return (
        <>
            <MenuLayout>
                {cargando ? (
                    <Box display="flex" justifyContent="center" alignItems="center" width={width} height="85vh">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TabHeader
                            activarBtnAtras={false}
                            titulo="Diagnóstico anónimo"
                            pestanas={listadoPestanas} />
                        <Grid container columns={numCols} spacing={2} sx={{ marginTop: "3vh", width: width }}>
                            <Grid size={numCols}>
                                <Typography variant="h6">
                                    <b>Datos personales</b>
                                </Typography>
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    select
                                    label="Sexo"
                                    name="sexo"
                                    value={datosTxt.sexo}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[0].error}
                                    helperText={errores[0].txt}
                                    disabled={desactivarCampos}
                                    fullWidth>
                                    {sexos.map((x) => (
                                        <MenuItem key={x.val} value={x.val}>
                                            {x.texto}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Edad"
                                    name="edad"
                                    value={datosTxt.edad}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[1].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[1].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={numCols}>
                                <Typography variant="h6">
                                    <b>Síntomas clínicos</b>
                                </Typography>
                            </Grid>
                            <Grid container size={numCols} columns={numCols} columnSpacing={0} rowSpacing={0} rowGap={0} columnGap={0}>
                                {sintomas.map((x) => (
                                    <Grid size={1} key={x.nombre}>
                                        <Check
                                            nombre={x.nombre}
                                            etiqueta={x.texto}
                                            desactivado={desactivarCampos}
                                            checked={datosBin[x.nombre]}
                                            manejadorCambios={manejadorCambiosDatosBin} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Grid size={numCols}>
                                <Typography variant="h6">
                                    <b>Signos vitales</b>
                                </Typography>
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Presión sistólica (mmHg)"
                                    name="presionSis"
                                    value={datosTxt.presionSis}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[2].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[2].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Presión diastólica (mmHg)"
                                    name="presionDias"
                                    value={datosTxt.presionDias}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[3].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[3].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Frecuencia respiratoria"
                                    name="frecRes"
                                    value={datosTxt.frecRes}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[4].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[4].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Frecuencia cardíaca"
                                    name="frecCard"
                                    value={datosTxt.frecCard}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[5].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[5].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Saturación de la sangre"
                                    name="so2"
                                    value={datosTxt.so2}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[6].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[6].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={numCols}>
                                <Typography variant="h6">
                                    <b>Exámenes de laboratorio</b>
                                </Typography>
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Conteo de plaquetas"
                                    name="plaquetas"
                                    value={datosTxt.plaquetas}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[7].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[7].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Hemoglobina"
                                    name="hemoglobina"
                                    value={datosTxt.hemoglobina}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[8].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[8].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    label="Conteo de glóbulos blancos"
                                    name="wbc"
                                    value={datosTxt.wbc}
                                    onChange={manejadorCambiosDatosTxt}
                                    error={errores[9].error}
                                    disabled={desactivarCampos}
                                    helperText={errores[9].txt}
                                    fullWidth />
                            </Grid>
                            <Grid size={numCols}>
                                <Check
                                    nombre="otraEnfermedad"
                                    etiqueta="El paciente padece otra enfermedad."
                                    checked={datosBin.otraEnfermedad}
                                    desactivado={desactivarCampos}
                                    manejadorCambios={manejadorCambiosDatosBin} />
                            </Grid>
                            {datosBin.otraEnfermedad ? (
                                <Grid size={numCols}>
                                    <SelectChip
                                        valor={otrasEnfermedades}
                                        listaValores={COMORBILIDADES}
                                        manejadorCambios={manejadorCambiosComor}
                                        nombre="comorbilidades"
                                        error={errores[10].error}
                                        txtError={errores[10].txt}
                                        desactivado={desactivarCampos}
                                        etiqueta="Padecimiento(s) del paciente"
                                    />
                                </Grid>
                            ) : null}
                            <Grid display="flex" justifyContent="center" size={numCols}>
                                <Stack direction="row" spacing={2}>
                                    <Tooltip title={diagnostico.diagnosticado ? "Ver resultados del diagnóstico" :"Genera el diagnóstico de TEP."}>
                                        <Button
                                            startIcon={diagnostico.diagnosticado ? <PersonSearchIcon/> : <DiagnosticoIcono />}
                                            variant="contained"
                                            onClick={manejadorBtnDiagnosticar}
                                            sx={{
                                                textTransform: "none"
                                            }}>
                                            <b>{diagnostico.diagnosticado ? "Ver diagnóstico" : "Diagnosticar"}</b>
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={diagnostico.diagnosticado ? "Vaciar los campos para realizar otro diagnóstico." : "Vaciar el contenido de los campos."}>
                                        <Button
                                            startIcon={<CloseIcon />}
                                            variant="contained"
                                            onClick={manejadorBtnVaciar}
                                            sx={{
                                                textTransform: "none"
                                            }}>
                                            <b>Vaciar campos</b>
                                        </Button>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </>)}
                <ModalSimple
                    abrir={modal.mostrar}
                    titulo={modal.titulo}
                    mensaje={modal.mensaje}
                    txtBtn="Cerrar"
                    manejadorBtnModal={() => setModal((x) => ({ ...x, mostrar: false }))}>
                    <Box>
                        {diagnostico.resultado ? (
                            <Typography variant="body1">
                                ⚠️ Atención, se ha <b>diagnosticado al paciente con TEP</b>, teniendo una probabilidad del <b>{diagnostico.probabilidad.toFixed(2)}%</b>.
                            </Typography>
                        ) : (
                            <Typography variant="body1">
                                ℹEl paciente <b>no ha sido diagnosticado con TEP</b>, la probabilidad de no padecerlo es del <b>{diagnostico.probabilidad.toFixed(2)-1}%</b>.
                            </Typography>
                        )}
                    </Box>
                </ModalSimple>
            </MenuLayout>
        </>
    );
};
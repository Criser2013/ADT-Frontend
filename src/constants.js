export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const DRIVE_API_URL = import.meta.env.VITE_DRIVE_API_URL || "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API_URL = import.meta.env.VITE_DRIVE_UPLOAD_API_URL || "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_FILENAME = import.meta.env.VITE_DRIVE_FILENAME || "HADT - Pacientes.xlsx";
export const DRIVE_FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || "HADT: Herramienta para apoyar el diagnóstico de TEP";
export const URL_MANUAL_USUARIO = import.meta.env.VITE_URL_MANUAL_USUARIO || "https://www.youtube.com";
export const URL_MANUAL_ADMIN = import.meta.env.VITE_URL_MANUAL_ADMIN || "https://www.google.com";
export const CANT_LIM_DIAGNOSTICOS = parseInt(import.meta.env.VITE_CANT_LIM_DIAGNOSTICOS) || 1500;
export const SEXOS = [
    { texto: "txtSelecSexo", val: 2 },
    { texto: "txtMasculino", val: 0 },
    { texto: "txtFemenino", val: 1 }
];
export const DIAGNOSTICOS = [
    { valor: 2, texto: "txtSelecDiagnostico" },
    { valor: 0, texto: "txtNegativo" },
    { valor: 1, texto: "txtPositivo" }
];
export const URL_CONDICIONES = import.meta.env.VITE_URL_CONDICIONES || "https://google.com";
export const CAMPOS_BIN = [
    "sexo", "fumador", "bebedor", "tos", "fiebre", "crepitaciones",
    "dolor_toracico", "malignidad", "hemoptisis", "disnea", "sibilancias",
    "derrame", "TEP_TVP_previo", "edema_de_m_inferiores", "sintomas_disautonomicos", "inmovilidad_de_m_inferiores",
    "viaje_prolongado", "proc_quirurgico_traumatismo", "otra_enfermedad", "soplos"
];
export const CAMPOS_DECIMALES = ["saturacion_de_la_sangre", "plt", "hb", "wbc"];
export const CAMPOS_ENTEROS = ["edad","presion_sistolica", "presion_diastolica", "frecuencia_respiratoria",
    "frecuencia_cardiaca"
];
export const CAMPOS_NUM = [...CAMPOS_DECIMALES, ...CAMPOS_ENTEROS];
export const COMORBILIDADES = ["Enfermedad vascular", "Trombofilia", "Enfermedad renal", "Enfermedad pulmonar",
    "Diabetes Mellitus", "Hipertensión arterial", "Hepatopatía crónica", "Enfermedad hematológica", "VIH", "Enfermedad cardíaca",
    "Enfermedad coronaria", "Enfermedad endocrina", "Enfermedad gastrointestinal", "Enfermedad urológica", "Enfermedad neurológica",
];



export const AES_KEY = import.meta.env.VITE_CLAVE_AES || "1234567890123456"; // Clave de 16 caracteres para AES-128
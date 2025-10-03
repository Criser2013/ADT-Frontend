export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const ENTORNO = import.meta.env.VITE_ENTORNO || "0"; // 0: local, 1: production
export const DRIVE_API_URL = import.meta.env.VITE_DRIVE_API_URL || "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API_URL = import.meta.env.VITE_DRIVE_UPLOAD_API_URL || "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_FILENAME = import.meta.env.VITE_DRIVE_FILENAME || "HADT - Pacientes.xlsx";
export const COMORBILIDADES = ["Enfermedad vascular", "Trombofilia", "Enfermedad renal", "Enfermedad pulmonar",
    "Diabetes", "Hipertensión arterial", "Hepatopatía crónica", "Enfermedad hematológica", "VIH", "Enfermedad cardíaca",
    "Enfermedad coronaria", "Enfermedad endocrina", "Enfermedad gastrointestinal", "Enfermedad urológica", "Enfermedad neurológica",
];
export const DRIVE_FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || "HADT: Herramienta para apoyar el diagnóstico de TEP";
export const URL_MANUAL_USUARIO = import.meta.env.VITE_URL_MANUAL_USUARIO || "https://www.youtube.com";
export const URL_MANUAL_ADMIN = import.meta.env.VITE_URL_MANUAL_ADMIN || "https://www.google.com";
export const CANT_LIM_DIAGNOSTICOS = parseInt(import.meta.env.VITE_CANT_LIM_DIAGNOSTICOS) || 1500;
export const SEXOS = [
    { texto: "txtSelecSexo", val: 2 },
    { texto: "txtMasculino", val: 0 },
    { texto: "txtFemenino", val: 1 }
];
export const CODIGO_ADMIN = 1001;
export const SINTOMAS = ["fumador", "bebedor", "tos", "fiebre", "edema",
    "inmovilidad", "cirugiaReciente", "disautonomicos", "viajeProlongado",
    "disnea", "sibilancias", "crepitaciones", "derrame", "malignidad",
    "hemoptisis", "dolorToracico", "tepPrevio", "soplos"
];
export const DIAGNOSTICOS = [
    { valor: 2, texto: "txtSelecDiagnostico" },
    { valor: 0, texto: "txtNegativo" },
    { valor: 1, texto: "txtPositivo" }
];
export const URL_CONDICIONES = import.meta.env.VITE_URL_CONDICIONES || "https://google.com";
export const CAMPOS_BIN = [
    "sexo", "fumador", "bebedor", "tos", "fiebre", "crepitaciones",
    "dolorToracico", "malignidad", "hemoptisis", "disnea", "sibilancias",
    "derrame", "tepPrevio", "edema", "disautonomicos", "inmovilidad",
    "viajeProlongado", "cirugiaReciente", "otraEnfermedad", "soplos"
];
export const CAMPOS_TXT = ["edad", "presionSis", "presionDias", "frecRes",
    "frecCard", "so2", "plaquetas", "hemoglobina", "wbc"];
export const AES_KEY = import.meta.env.VITE_CLAVE_AES;
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const ENTORNO = import.meta.env.VITE_ENTORNO || "0"; // 0: local, 1: production
export const DRIVE_API_URL = import.meta.env.VITE_DRIVE_API_URL || "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API_URL = import.meta.env.VITE_DRIVE_UPLOAD_API_URL || "https://www.googleapis.com/upload/drive/v3";
export const DRIVE_FILENAME = import.meta.env.VITE_DRIVE_FILENAME || "HADT - Pacientes.xlsx";
export const COMORBILIDADES = ["vascular", "trombofilia", "renal", "pulmonar", "diabetes",
    "hipertension", "hepatopatia", "hematologica", "vih", "cardiaca", "coronaria","endocrina",
    "gastrointestinal", "urologica", "neurologica",
];
export const EXPORT_FILENAME = `HADT Diagnósticos — `;
export const DRIVE_FOLDER_NAME = import.meta.env.VITE_DRIVE_FOLDER_NAME || "HADT: Herramienta para apoyar el diagnóstico de TEP";
export const URL_MANUAL_USUARIO = import.meta.env.VITE_URL_MANUAL_USUARIO || "https://www.youtube.com";
export const URL_MANUAL_ADMIN = import.meta.env.VITE_URL_MANUAL_ADMIN || "https://www.google.com";
export const CANT_LIM_DIAGNOSTICOS = parseInt(import.meta.env.VITE_CANT_LIM_DIAGNOSTICOS) || 1500;
export const SEXOS = [
    { texto: "Seleccione el sexo", val: 2 },
    { texto: "Masculino", val: 0 },
    { texto: "Femenino", val: 1 }
];
export const CODIGO_ADMIN = 1001;
export const SINTOMAS = [ "fumador", "bebedor", "tos", "fiebre", "edema",
    "inmovilidad", "cirugiaReciente", "disautonomicos", "viajeProlongado",
    "disnea", "sibilancias", "crepitaciones", "derrame", "malignidad",
    "hemoptisis", "dolorToracico", "tepPrevio", "soplos"
];
export const DIAGNOSTICOS = [
    { valor: 2, texto: "Seleccione el diagnóstico" },
    { valor: 0, texto: "Negativo" },
    { valor: 1, texto: "Positivo" }
];
export const URL_CONDICIONES = import.meta.env.VITE_URL_CONDICIONES || "https://google.com";
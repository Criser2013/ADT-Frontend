import useIdioma from "./idioma-hook";
import useTema from "./tema-hook";
import { useAuth } from "./auth-hook";
import { useAppConfig } from "./appConfig-hook";
import { useOperacionesPacientes, usePaciente, usePacientes }   from "./pacientes-hook";
import { useDiagnostico, useDiagnosticos, useOperacionesDiagnosticos } from "./diagnosticos-hook";
import { useOperacionesUsuarios, useUsuario, useUsuarios } from "./usuarios-hook";

export {
    useAppConfig, useAuth, useDiagnostico, useDiagnosticos, useIdioma, 
    useOperacionesDiagnosticos, useOperacionesPacientes,
    useOperacionesUsuarios, usePaciente, usePacientes,
    useTema, useUsuario, useUsuarios,
};
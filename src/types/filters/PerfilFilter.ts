export default interface PerfilFilter {
    id?: number;
    nombre?: string;
    nivel?: number; // Puedes usar este campo si los perfiles tienen niveles, si es aplicable
    activo?: boolean;
    idInstitucion?: number;
}
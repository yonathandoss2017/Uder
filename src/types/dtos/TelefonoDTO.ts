export default interface TelefonoDTO {
    id?: number;
    telefono: number;
    idUsuario: number;
}

export function formatTelefono(telefono: number): string {
    const telefonoStr :string= telefono.toString();
    if(telefonoStr.startsWith('9')) {
        // Número de celular
        // Formato: 09X-XXX-XXX
        return telefonoStr.replace(/(\d{2})(\d{3})(\d{3})/, '0$1-$2-$3');
    } else {
        // Número de teléfono fijo
        // Formato: XXXX-XXXX
        return telefonoStr.replace(/(\d{4})(\d{4})/, '$1-$2');
    }
}